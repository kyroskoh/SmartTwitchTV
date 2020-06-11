//Global
var UserLiveFeedobj_AGamesPos = 0;
var UserLiveFeedobj_GamesPos = 1;
var UserLiveFeedobj_FeaturedPos = 2;
var UserLiveFeedobj_CurrentGamePos = 3;
var UserLiveFeedobj_LivePos = 4;
//User
var UserLiveFeedobj_UserLivePos = 5;
var UserLiveFeedobj_UserHistoryPos = 6;
var UserLiveFeedobj_UserHostPos = 7;
var UserLiveFeedobj_UserGamesPos = 8;
var UserLiveFeedobj_UserAGamesPos = 9;

//Check bellow java before define more current max is 0 to 9, 1 is used by the side panel
//public String[][] ExtraPlayerHandlerResult = new String[10][100];

var UserLiveFeed_FeedPosX = UserLiveFeedobj_UserLivePos;//Default pos
var UserLiveFeedobj_MAX = UserLiveFeedobj_UserGamesPos;
var UserLiveFeedobj_MAX_No_user = UserLiveFeedobj_LivePos;

function UserLiveFeedobj_StartDefault(pos) {
    if (UserLiveFeed_status[pos]) {
        if (UserLiveFeed_ThumbNull(pos + '_' + UserLiveFeed_FeedPosY[pos], UserLiveFeed_ids[0]))
            UserLiveFeed_LastPos[pos] =
                JSON.parse(document.getElementById(UserLiveFeed_ids[3] + pos + '_' + UserLiveFeed_FeedPosY[pos]).getAttribute(Main_DataAttribute))[14];
    } else {
        UserSidePannel_LastPos[pos] = null;
        UserLiveFeed_LastPos[pos] = null;
    }

    UserLiveFeed_lastRefresh[pos] = new Date().getTime();
    UserLiveFeed_obj[pos].offsettopFontsize = Settings_Obj_default('global_font_offset');
    UserLiveFeed_cell[pos] = [];
    UserLiveFeed_idObject[pos] = {};

    UserLiveFeed_itemsCount[pos] = 0;
    Main_emptyWithEle(UserLiveFeed_obj[pos].div);
    UserLiveFeed_status[pos] = false;
    UserLiveFeed_FeedPosY[pos] = 0;
    UserLiveFeed_FeedSetPosLast[pos] = 0;
    UserLiveFeed_obj[pos].offset = 0;
    UserLiveFeed_obj[pos].loadingMore = false;
    UserLiveFeed_obj[pos].dataEnded = false;
    UserLiveFeed_obj[pos].div.style.transform = 'translateX(0px)';

    Main_ShowElement('dialog_loading_side_feed');
    if (UserLiveFeed_isFeedShow()) {
        UserLiveFeed_obj[pos].div.classList.remove('hide');
    }
}

function UserLiveFeedobj_CheckToken() {
    if (UserLiveFeed_status[UserLiveFeedobj_UserLivePos]) {
        if (UserLiveFeed_ThumbNull(Sidepannel_PosFeed, UserLiveFeed_side_ids[0]))
            UserSidePannel_LastPos[UserLiveFeedobj_UserLivePos] = JSON.parse(document.getElementById(UserLiveFeed_side_ids[3] + Sidepannel_PosFeed).getAttribute(Main_DataAttribute))[6];
    }
    UserLiveFeed_PreloadImgs = [];
    Sidepannel_PosFeed = 0;
    Main_empty('side_panel_holder');
    document.getElementById('side_panel_warn').style.display = 'none';

    UserLiveFeed_loadChannelOffsset = 0;
    UserLiveFeed_followerChannels = '';

    UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserLivePos);

    UserLiveFeed_token = AddUser_UsernameArray[0].access_token;
    if (UserLiveFeed_token) {
        UserLiveFeed_token = Main_OAuth + UserLiveFeed_token;
        UserLiveFeedobj_loadChannelUserLive();
    } else {
        UserLiveFeedobj_loadDataPrepare(UserLiveFeedobj_UserLivePos);
        UserLiveFeed_token = null;
        UserLiveFeedobj_loadChannels();
    }

    //Main_Log('UserLiveFeedobj_CheckToken end');
}

function UserLiveFeedobj_loadDataPrepare(pos) {
    UserLiveFeed_loadingData[pos] = true;
    UserLiveFeed_loadingDataTry[pos] = 0;
}

function UserLiveFeedobj_BaseLoad(url, headers, callback, CheckOffset, pos) {
    //Main_Log('UserLiveFeedobj_BaseLoad');

    if (CheckOffset) UserLiveFeedobj_CheckOffset(pos);

    BasexmlHttpGet(
        url,
        DefaultHttpGetTimeout + (UserLiveFeed_loadingDataTry[pos] * DefaultHttpGetTimeoutPlus),
        headers,
        null,
        callback,
        function() {
            UserLiveFeedobj_loadDataError(pos);
        }
    );
}

function UserLiveFeedobj_loadDataError(pos) {
    //Main_Log('UserLiveFeedobj_loadChannels');
    UserLiveFeed_loadingDataTry[pos]++;
    if (UserLiveFeed_loadingDataTry[pos] < DefaultHttpGetReTryMax) {
        UserLiveFeed_obj[pos].load();
    } else {
        if (!UserLiveFeed_obj[pos].loadingMore) {
            UserLiveFeed_loadingDataTry[pos] = 0;
            UserLiveFeed_loadingData[pos] = false;
            UserLiveFeed_Showloading(false);
            Main_HideElement('dialog_loading_side_feed');

            if (UserLiveFeed_isFeedShow()) {
                UserLiveFeedobj_HolderDiv(pos, STR_REFRESH_PROBLEM);
            }
        } else {
            UserLiveFeed_obj[pos].loadingMore = false;
            UserLiveFeed_obj[pos].dataEnded = true;
        }
    }
}

function UserLiveFeedobj_Empty(pos) {
    UserLiveFeedobj_HolderDiv(pos, STR_NO_LIVE_CONTENT);
}

function UserLiveFeedobj_HolderDiv(pos, text) {
    Main_innerHTMLWithEle(UserLiveFeed_obj[pos].div,
        '<div style="color: #FFFFFF;text-align: center;vertical-align: middle;margin-bottom: 7%;font-size: 150%;"> ' + text + '</div>');
}

function UserLiveFeedobj_loadChannels() {
    //Main_Log('UserLiveFeedobj_loadChannels');
    UserLiveFeedobj_BaseLoad(
        Main_kraken_api + 'users/' + encodeURIComponent(AddUser_UsernameArray[0].id) +
        '/follows/channels?limit=100&offset=' + UserLiveFeed_loadChannelOffsset + '&sortby=created_at' + Main_TwithcV5Flag,
        2,
        UserLiveFeedobj_loadChannelLive,
        false,
        UserLiveFeedobj_UserLivePos
    );
}

function UserLiveFeedobj_loadChannelLive(responseText) {
    //Main_Log('UserLiveFeedobj_loadChannelLive');

    var response = JSON.parse(responseText).follows,
        response_items = response.length;

    if (response_items) { // response_items here is not always 99 because banned channels, so check until it is 0
        var ChannelTemp = '',
            x = 0;

        for (x; x < response_items; x++) {
            ChannelTemp = response[x].channel._id + ',';
            if (!Main_A_includes_B(UserLiveFeed_followerChannels, ChannelTemp)) UserLiveFeed_followerChannels += ChannelTemp;
        }

        UserLiveFeed_loadChannelOffsset += response_items;
        UserLiveFeedobj_loadDataPrepare(UserLiveFeedobj_UserLivePos);
        UserLiveFeedobj_loadChannels();
    } else { // end
        UserLiveFeed_followerChannels = UserLiveFeed_followerChannels.slice(0, -1);
        UserLiveFeedobj_loadDataPrepare(UserLiveFeedobj_UserLivePos);
        UserLiveFeedobj_loadChannelUserLive();
    }
}

function UserLiveFeedobj_loadChannelUserLive() {
    //Main_Log('UserLiveFeedobj_loadChannelUserLive');
    var theUrl = Main_kraken_api + 'streams/';

    if (UserLiveFeed_token) {
        theUrl += 'followed?';
    } else {
        theUrl += '?channel=' + encodeURIComponent(UserLiveFeed_followerChannels) + '&';
    }
    theUrl += 'limit=100&offset=0&stream_type=all' + Main_TwithcV5Flag;

    UserLiveFeedobj_loadChannelUserLiveGet(theUrl);
}

function UserLiveFeedobj_loadChannelUserLiveGet(theUrl) {
    //Main_Log('UserLiveFeedobj_loadChannelUserLiveGet');
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.timeout = DefaultHttpGetTimeout + (UserLiveFeed_loadingDataTry[UserLiveFeedobj_UserLivePos] * DefaultHttpGetTimeoutPlus);

    xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
    xmlHttp.setRequestHeader(Main_AcceptHeader, Main_TwithcV5Json);
    if (UserLiveFeed_token) xmlHttp.setRequestHeader(Main_Authorization, UserLiveFeed_token);

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) UserLiveFeedobj_loadChannelUserLiveGetEnd(xmlHttp);
    };

    xmlHttp.send(null);
}

function UserLiveFeedobj_loadChannelUserLiveGetEnd(xmlHttp) {
    //Main_Log('UserLiveFeedobj_loadChannelUserLiveGetEnd ' + xmlHttp.status);
    if (xmlHttp.status === 200) {
        UserLiveFeedobj_loadDataSuccess(xmlHttp.responseText);
    } else if (UserLiveFeed_token && (xmlHttp.status === 401 || xmlHttp.status === 403)) { //token expired
        //Token has change or because is new or because it is invalid because user delete in twitch settings
        // so callbackFuncOK and callbackFuncNOK must be the same to recheck the token
        AddCode_refreshTokens(0, 0, UserLiveFeedobj_CheckToken, UserLiveFeedobj_loadDataRefreshTokenError);
    } else {
        UserLiveFeedobj_loadDataError(UserLiveFeedobj_UserLivePos);
    }
}

function UserLiveFeedobj_loadDataRefreshTokenError() {
    //Main_Log('UserLiveFeedobj_loadDataRefreshTokenError');

    if (!AddUser_UsernameArray[0].access_token) UserLiveFeedobj_CheckToken();
    else UserLiveFeedobj_loadDataError(UserLiveFeedobj_UserLivePos);
}

var UserLiveFeedobj_LiveNotificationClearId;
function UserLiveFeedobj_LiveNotification() {
    if (UserLiveFeed_NotifyRunning || !UserLiveFeed_NotifyLiveidObject.length) {
        if (!UserLiveFeed_Notify) UserLiveFeed_NotifyLiveidObject = [];

        return;
    }

    //Reset notifications after 2 times the time it takes just in case imf load and error fail some how
    UserLiveFeedobj_LiveNotificationClearId = Main_setTimeout(
        UserLiveFeedobj_LiveNotificationClear,
        ((UserLiveFeed_NotifyTimeout + 1500) * 2 * UserLiveFeed_NotifyLiveidObject.length),
        UserLiveFeedobj_LiveNotificationClearId
    );

    Main_ShowElement('user_feed_notify');

    UserLiveFeed_NotifyRunning = true;

    Main_setTimeout(
        function() {
            UserLiveFeedobj_LiveNotificationShow(0);
        },
        1000
    );
}

function UserLiveFeedobj_LiveNotificationShow(position) {
    Sidepannel_Notify_img.onload = function() {
        this.onload = null;
        this.onerror = null;
        UserLiveFeedobj_LiveNotificationOnload(position);
    };

    Sidepannel_Notify_img.onerror = function() {
        this.onerror = null;
        this.onload = null;
        this.src = IMG_404_LOGO;
        UserLiveFeedobj_LiveNotificationOnload(position);
    };

    //If the user refresh too fast and a new live channel is there all the time this may fail
    if (UserLiveFeed_NotifyLiveidObject[position] && UserLiveFeed_NotifyLiveidObject[position].hasOwnProperty('logo'))
        Sidepannel_Notify_img.src = UserLiveFeed_NotifyLiveidObject[position].logo;
    else UserLiveFeedobj_LiveNotificationHide(position);
}

var UserLiveFeedobj_LiveNotificationHideId;
function UserLiveFeedobj_LiveNotificationOnload(position) {
    if (!UserLiveFeed_NotifyLiveidObject[position]) {
        UserLiveFeedobj_LiveNotificationHide(position);
        return;
    }

    Main_innerHTML('user_feed_notify_name', '<i class="icon-' + (!UserLiveFeed_NotifyLiveidObject[position].rerun ? 'circle" style="color: red;' : 'refresh" style="') + ' font-size: 75%; "></i>' + STR_SPACE + UserLiveFeed_NotifyLiveidObject[position].name);

    Main_textContent('user_feed_notify_game', UserLiveFeed_NotifyLiveidObject[position].game);
    Main_innerHTML('user_feed_notify_title', UserLiveFeed_NotifyLiveidObject[position].title);

    Main_RemoveClass('user_feed_notify', 'user_feed_notify_hide');

    UserLiveFeedobj_LiveNotificationHideId = Main_setTimeout(
        function() {
            UserLiveFeedobj_LiveNotificationHide(position);
        },
        UserLiveFeed_NotifyTimeout,
        UserLiveFeedobj_LiveNotificationHideId
    );
}

var UserLiveFeedobj_LiveNotificationShowId;
function UserLiveFeedobj_LiveNotificationHide(position) {
    Main_AddClass('user_feed_notify', 'user_feed_notify_hide');

    if (position < (UserLiveFeed_NotifyLiveidObject.length - 1)) {
        UserLiveFeedobj_LiveNotificationShowId = Main_setTimeout(
            function() {
                UserLiveFeedobj_LiveNotificationShow(position + 1);
            },
            800,
            UserLiveFeedobj_LiveNotificationShowId
        );
    } else UserLiveFeedobj_LiveNotificationClear();
}

function UserLiveFeedobj_LiveNotificationClear() {
    Main_clearTimeout(UserLiveFeedobj_LiveNotificationClearId);
    UserLiveFeed_NotifyRunning = false;
    UserLiveFeed_NotifyLiveidObject = [];

    UserLiveFeedobj_LiveNotificationClearId = Main_setTimeout(
        function() {
            Main_HideElement('user_feed_notify');
        },
        10000,
        UserLiveFeedobj_LiveNotificationClearId
    );
}

var UserLiveFeedobj_LiveFeedOldUserName = '';
function UserLiveFeedobj_ShowFeed() {
    UserLiveFeedobj_SetBottomText(4);

    if (AddUser_UserIsSet()) {
        UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserLivePos, (UserLiveFeedobj_LiveFeedOldUserName !== AddUser_UsernameArray[0].name));
        UserLiveFeedobj_LiveFeedOldUserName = AddUser_UsernameArray[0].name;
    }
}

function UserLiveFeedobj_ShowFeedCheck(pos, forceRefressh) {

    if (Main_isScene2DocShown() && !UserLiveFeed_isFeedShow()) UserLiveFeed_Show();

    if (forceRefressh || !UserLiveFeed_ThumbNull(pos + '_' + UserLiveFeed_FeedPosY[pos], UserLiveFeed_ids[0]) ||
        (new Date().getTime()) > (UserLiveFeed_lastRefresh[pos] + (Settings_Obj_values("auto_refresh_screen") * 60000)) ||
        UserLiveFeed_obj[pos].offsettopFontsize !== Settings_Obj_default('global_font_offset') || !UserLiveFeed_obj[pos].AddCellsize) {

        if (UserLiveFeed_loadingData[pos]) {

            if (UserLiveFeed_isFeedShow()) {
                UserLiveFeed_Showloading(true);
                UserLiveFeed_obj[pos].div.classList.remove('hide');
            }
        } else {

            UserLiveFeed_StartLoad();
        }

    } else {

        UserLiveFeed_obj[pos].div.classList.remove('hide');

        UserLiveFeed_FeedAddFocus(true, pos);
    }
}

function UserLiveFeedobj_HideFeed() {
    UserLiveFeed_CheckIfIsLiveSTop();
    UserLiveFeed_obj[UserLiveFeedobj_UserLivePos].div.classList.add('hide');
}

//Live history start
function UserLiveFeedobj_HideHistory() {
    UserLiveFeed_CheckIfIsLiveSTop();
    UserLiveFeed_obj[UserLiveFeedobj_UserHistoryPos].div.classList.add('hide');
}

var UserLiveFeedobj_ShowHistoryLength = -1;
function UserLiveFeedobj_ShowHistory() {
    UserLiveFeedobj_SetBottomText(5);

    if (AddUser_UserIsSet()) {
        UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserHistoryPos, true);//(UserLiveFeedobj_ShowHistoryLength !== Main_values_History_data[AddUser_UsernameArray[0].id].live.length)
        UserLiveFeedobj_ShowHistoryLength = Main_values_History_data[AddUser_UsernameArray[0].id].live.length;
    }

}

function UserLiveFeedobj_History() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserHistoryPos);
    var pos = UserLiveFeedobj_UserHistoryPos,
        response = JSON.parse(JSON.stringify(Main_values_History_data[AddUser_UsernameArray[0].id].live)),
        response_items,
        len = response.length,
        cell, id,
        i = 0,
        itemsCount = UserLiveFeed_itemsCount[pos],
        streamerID = {};

    response.sort(
        function(a, b) {
            return (a.date > b.date ? -1 : (a.date < b.date ? 1 : 0));
        }
    );

    response_items = Math.min(len, 100);

    if (response_items) {

        for (i; i < response_items; i++) {
            cell = response[i];
            id = cell.data[7];
            if (!cell.forceVod) {

                if (!UserLiveFeed_idObject[pos].hasOwnProperty(id) && cell.data[14] !== '') {

                    UserLiveFeed_idObject[pos][id] = itemsCount;

                    UserLiveFeed_cell[pos][itemsCount] =
                        UserLiveFeedobj_CreatFeed(
                            pos + '_' + itemsCount,
                            cell.data,
                            false,
                            cell.date,
                            cell.vodimg,
                            (streamerID[cell.data[14]] && cell.vodid) || cell.forceVod
                        );

                    streamerID[cell.data[14]] = 1;
                    itemsCount++;
                }

            } else if (len > (response_items + 1)) {
                response_items++;
            }
        }

        if (!itemsCount) UserLiveFeedobj_Empty(pos);
    } else UserLiveFeedobj_Empty(pos);

    UserLiveFeed_itemsCount[pos] = itemsCount;

    UserLiveFeed_loadDataSuccessFinish(false, pos);
}

//Live history end

//Live Start
function UserLiveFeedobj_Live() {
    if (!UserLiveFeed_obj[UserLiveFeedobj_LivePos].loadingMore) UserLiveFeedobj_StartDefault(UserLiveFeedobj_LivePos);
    UserLiveFeedobj_loadLive();
}

function UserLiveFeedobj_loadLive() {
    UserLiveFeedobj_BaseLoad(
        Main_kraken_api + 'streams?limit=100&offset=' + UserLiveFeed_obj[UserLiveFeedobj_LivePos].offset +
        (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '') +
        Main_TwithcV5Flag,
        2,
        UserLiveFeedobj_loadDataLiveSuccess,
        true,
        UserLiveFeedobj_LivePos
    );
}

function UserLiveFeedobj_LiveCell(cell) {
    return cell;
}

function UserLiveFeedobj_loadDataLiveSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_LivePos);
}

function UserLiveFeedobj_ShowLive() {
    UserLiveFeedobj_SetBottomText(3);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_LivePos);
}

function UserLiveFeedobj_HideLive() {
    UserLiveFeed_CheckIfIsLiveSTop();
    UserLiveFeed_obj[UserLiveFeedobj_LivePos].div.classList.add('hide');
}

//Live end

//Featured Start
function UserLiveFeedobj_Featured() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_FeaturedPos);
    UserLiveFeedobj_loadFeatured();
}

function UserLiveFeedobj_loadFeatured() {
    UserLiveFeedobj_BaseLoad(
        Main_kraken_api + 'streams/featured?limit=100' + (AddUser_UserIsSet() && AddUser_UsernameArray[0].access_token ? '&oauth_token=' +
            AddUser_UsernameArray[0].access_token : '') + Main_TwithcV5Flag,
        2,
        UserLiveFeedobj_loadDataFeaturedSuccess,
        false,
        UserLiveFeedobj_FeaturedPos
    );
}

function UserLiveFeedobj_FeaturedCell(cell) {
    return cell.stream;
}

function UserLiveFeedobj_loadDataFeaturedSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_FeaturedPos);
}

function UserLiveFeedobj_ShowFeatured() {
    UserLiveFeedobj_SetBottomText(1);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_FeaturedPos);
}

function UserLiveFeedobj_HideFeatured() {
    UserLiveFeed_CheckIfIsLiveSTop();
    UserLiveFeed_obj[UserLiveFeedobj_FeaturedPos].div.classList.add('hide');
}
//Featured end

//Current game Start
function UserLiveFeedobj_CurrentGame() {
    if (!UserLiveFeed_obj[UserLiveFeedobj_CurrentGamePos].loadingMore) UserLiveFeedobj_StartDefault(UserLiveFeedobj_CurrentGamePos);
    UserLiveFeedobj_loadCurrentGame();
}

function UserLiveFeedobj_loadCurrentGame() {
    UserLiveFeedobj_BaseLoad(
        Main_kraken_api + 'streams?game=' + encodeURIComponent(Play_data.data[3]) +
        '&limit=100&offset=' + UserLiveFeed_obj[UserLiveFeedobj_CurrentGamePos].offset +
        (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '') + Main_TwithcV5Flag,
        2,
        UserLiveFeedobj_loadDataCurrentGameSuccess,
        true,
        UserLiveFeedobj_CurrentGamePos
    );
}

function UserLiveFeedobj_CurrentGameCell(cell) {
    return cell;
}

function UserLiveFeedobj_loadDataCurrentGameSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_CurrentGamePos);
}

var UserLiveFeedobj_CurrentGameName = '';
function UserLiveFeedobj_ShowCurrentGame() {
    UserLiveFeedobj_SetBottomText(2);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_CurrentGamePos, (UserLiveFeedobj_CurrentGameName !== Play_data.data[3]));
    UserLiveFeedobj_CurrentGameName = Play_data.data[3];
}

function UserLiveFeedobj_HideCurrentGame() {
    UserLiveFeed_CheckIfIsLiveSTop();
    UserLiveFeed_obj[UserLiveFeedobj_CurrentGamePos].div.classList.add('hide');
}
//Current game end

//User Host Start
function UserLiveFeedobj_UserHost() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserHostPos);
    UserLiveFeedobj_loadUserHost();
}

function UserLiveFeedobj_loadUserHost() {
    var theUrl = 'https://api.twitch.tv/api/users/' + encodeURIComponent(AddUser_UsernameArray[0].name) +
        '/followed/hosting?limit=100';

    BasexmlHttpHlsGet(
        theUrl,
        DefaultHttpGetTimeout + (UserLiveFeed_loadingDataTry[UserLiveFeedobj_UserHostPos] * DefaultHttpGetTimeoutPlus),
        2,
        null,
        UserLiveFeedobj_loadDataUserHostSuccess,
        function() {
            UserLiveFeedobj_loadDataError(UserLiveFeedobj_UserHostPos);
        }
    );
}



var UserLiveFeedobj_HostFeedOldUserName = '';
function UserLiveFeedobj_ShowUserHost() {
    UserLiveFeedobj_SetBottomText(6);

    if (AddUser_UserIsSet()) {
        UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserHostPos, (UserLiveFeedobj_HostFeedOldUserName !== AddUser_UsernameArray[0].name));
        UserLiveFeedobj_HostFeedOldUserName = AddUser_UsernameArray[0].name;
    }
}

function UserLiveFeedobj_HideUserHost() {
    UserLiveFeed_CheckIfIsLiveSTop();
    UserLiveFeed_obj[UserLiveFeedobj_UserHostPos].div.classList.add('hide');
}
//User Host end


//User Games Start
function UserLiveFeedobj_UserGames() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserGamesPos);
    UserLiveFeedobj_loadUserGames();
}

function UserLiveFeedobj_loadUserGames() {
    var theUrl = 'https://api.twitch.tv/api/users/' + encodeURIComponent(AddUser_UsernameArray[0].name) + '/follows/games/live?limit=250';//follows

    BasexmlHttpHlsGet(
        theUrl,
        DefaultHttpGetTimeout + (UserLiveFeed_loadingDataTry[UserLiveFeedobj_UserGamesPos] * DefaultHttpGetTimeoutPlus),

        1,
        null,
        UserLiveFeedobj_loadDataUserGamesSuccess,
        function() {
            UserLiveFeedobj_loadDataError(UserLiveFeedobj_UserGamesPos);
        }
    );
}

function UserLiveFeedobj_loadDataUserGamesSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseGamesSuccess(responseText, UserLiveFeedobj_UserGamesPos, 'follows');
}

var UserLiveFeedobj_GamesFeedOldUserName = '';
function UserLiveFeedobj_ShowUserGames() {
    UserLiveFeedobj_SetBottomText(7);

    if (AddUser_UserIsSet()) {
        UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserGamesPos, (UserLiveFeedobj_GamesFeedOldUserName !== AddUser_UsernameArray[0].name));
        UserLiveFeedobj_GamesFeedOldUserName = AddUser_UsernameArray[0].name;
    }
}

function UserLiveFeedobj_HideUserGames() {
    UserLiveFeed_obj[UserLiveFeedobj_UserGamesPos].div.classList.add('hide');
}
//User Games end

//Current user a game Start
var UserLiveFeedobj_CurrentUserAGameEnable = false;
function UserLiveFeedobj_CurrentUserAGame() {
    if (!UserLiveFeed_obj[UserLiveFeedobj_UserAGamesPos].loadingMore) UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserAGamesPos);
    UserLiveFeedobj_loadCurrentUserAGame();
}

function UserLiveFeedobj_loadCurrentUserAGame() {
    UserLiveFeedobj_BaseLoad(
        Main_kraken_api + 'streams?game=' + encodeURIComponent(UserLiveFeedobj_CurrentUserAGameNameEnter) +
        '&limit=100&offset=' + UserLiveFeed_obj[UserLiveFeedobj_UserAGamesPos].offset +
        (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '') + Main_TwithcV5Flag,
        2,
        UserLiveFeedobj_loadDataCurrentUserGameSuccess,
        true,
        UserLiveFeedobj_UserAGamesPos
    );
}

function UserLiveFeedobj_CurrentUserGameCell(cell) {
    return cell;
}

function UserLiveFeedobj_loadDataCurrentUserGameSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_UserAGamesPos);
}

var UserLiveFeedobj_CurrentUserAGameName = '';
var UserLiveFeedobj_CurrentUserAGameNameEnter = null;
function UserLiveFeedobj_ShowCurrentUserAGame() {
    UserLiveFeedobj_SetBottomText(7);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserAGamesPos, (UserLiveFeedobj_CurrentUserAGameName !== UserLiveFeedobj_CurrentUserAGameNameEnter));
    UserLiveFeedobj_CurrentUserAGameName = UserLiveFeedobj_CurrentUserAGameNameEnter;
    Main_IconLoad('icon_feed_back', 'icon-arrow-left', STR_BACK_USER_GAMES + STR_USER + STR_SPACE + STR_GAMES);
    Main_ShowElement('icon_feed_back');
}

function UserLiveFeedobj_HideCurrentUserAGame() {
    UserLiveFeed_CheckIfIsLiveSTop();
    UserLiveFeed_obj[UserLiveFeedobj_UserAGamesPos].div.classList.add('hide');
}
//Current user a game end

//Games Start
function UserLiveFeedobj_Games() {
    if (!UserLiveFeed_obj[UserLiveFeedobj_GamesPos].loadingMore) UserLiveFeedobj_StartDefault(UserLiveFeedobj_GamesPos);
    UserLiveFeedobj_loadGames();
}

function UserLiveFeedobj_loadGames() {
    UserLiveFeedobj_BaseLoad(
        Main_kraken_api + 'games/top?limit=100&offset=' + UserLiveFeed_obj[UserLiveFeedobj_GamesPos].offset,
        2,
        UserLiveFeedobj_loadDataGamesSuccess,
        false,
        UserLiveFeedobj_GamesPos
    );

    if (UserLiveFeed_obj[UserLiveFeedobj_GamesPos].offset &&
        (UserLiveFeed_obj[UserLiveFeedobj_GamesPos].offset + 100) > UserLiveFeed_obj[UserLiveFeedobj_GamesPos].MaxOffset)
        UserLiveFeed_obj[UserLiveFeedobj_GamesPos].dataEnded = true;
}

function UserLiveFeedobj_loadDataGamesSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseGamesSuccess(responseText, UserLiveFeedobj_GamesPos, 'top');
}

function UserLiveFeedobj_ShowGames() {
    UserLiveFeedobj_SetBottomText(0);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_GamesPos);
}

function UserLiveFeedobj_HideGames() {
    UserLiveFeed_obj[UserLiveFeedobj_GamesPos].div.classList.add('hide');
}
//Games end

//Current a game Start
var UserLiveFeedobj_CurrentAGameEnable = false;
function UserLiveFeedobj_CurrentAGame() {
    if (!UserLiveFeed_obj[UserLiveFeedobj_AGamesPos].loadingMore) UserLiveFeedobj_StartDefault(UserLiveFeedobj_AGamesPos);
    UserLiveFeedobj_loadCurrentAGame();
}

function UserLiveFeedobj_loadCurrentAGame() {
    UserLiveFeedobj_BaseLoad(
        Main_kraken_api + 'streams?game=' + encodeURIComponent(UserLiveFeedobj_CurrentAGameNameEnter) +
        '&limit=100&offset=' + UserLiveFeed_obj[UserLiveFeedobj_AGamesPos].offset +
        (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '') + Main_TwithcV5Flag,
        2,
        UserLiveFeedobj_loadDataCurrentAGameSuccess,
        true,
        UserLiveFeedobj_AGamesPos
    );
}

function UserLiveFeedobj_CurrentAGameCell(cell) {
    return cell;
}

function UserLiveFeedobj_loadDataCurrentAGameSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_AGamesPos);
}

var UserLiveFeedobj_CurrentAGameName = '';
var UserLiveFeedobj_CurrentAGameNameEnter = null;
function UserLiveFeedobj_ShowCurrentAGame() {
    UserLiveFeedobj_SetBottomText(0);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_AGamesPos, (UserLiveFeedobj_CurrentAGameName !== UserLiveFeedobj_CurrentAGameNameEnter));
    UserLiveFeedobj_CurrentAGameName = UserLiveFeedobj_CurrentAGameNameEnter;
    Main_IconLoad('icon_feed_back', 'icon-arrow-left', STR_BACK_USER_GAMES + STR_GAMES);
    Main_ShowElement('icon_feed_back');
}

function UserLiveFeedobj_HideCurrentAGame() {
    UserLiveFeed_CheckIfIsLiveSTop();
    UserLiveFeed_obj[UserLiveFeedobj_AGamesPos].div.classList.add('hide');
}
//Current a game end

function UserLiveFeedobj_SetBottomText(pos) {
    var i = 0;
    for (i; i < 8; i++)
        Main_RemoveClass('feed_end_' + i, 'feed_end_name_focus');

    Main_AddClass('feed_end_' + pos, 'feed_end_name_focus');

    for (i = 0; i < 7; i++) {
        if (i < pos) {
            Main_RemoveClass('feed_end_icon_' + i, 'feed_end_icon_up');
            Main_AddClass('feed_end_icon_' + i, 'feed_end_icon_down');

            Main_RemoveClass('feed_end_icon_' + i, 'icon-key-down');
            Main_AddClass('feed_end_icon_' + i, 'icon-key-up');
        } else {
            Main_RemoveClass('feed_end_icon_' + i, 'feed_end_icon_down');
            Main_AddClass('feed_end_icon_' + i, 'feed_end_icon_up');

            Main_RemoveClass('feed_end_icon_' + i, 'icon-key-up');
            Main_AddClass('feed_end_icon_' + i, 'icon-key-down');
        }
    }

    Main_innerHTML('feed_end_0', (UserLiveFeedobj_CurrentAGameEnable ? UserLiveFeedobj_CurrentAGameNameEnter : (STR_GAMES)));
    Main_innerHTML('feed_end_2', (Play_data.data[3] !== '' ? Play_data.data[3] : STR_NO_GAME));
    Main_innerHTML('feed_end_7', (UserLiveFeedobj_CurrentUserAGameEnable ? UserLiveFeedobj_CurrentUserAGameNameEnter : (STR_USER + STR_SPACE + STR_GAMES)));

}

function UserLiveFeedobj_CreatSideFeed(id, data) {

    var div = document.createElement('div');
    div.setAttribute('id', UserLiveFeed_side_ids[3] + id);
    div.setAttribute(Main_DataAttribute, JSON.stringify(data));
    div.className = 'side_panel_feed';

    div.innerHTML = '<div id="' + UserLiveFeed_side_ids[0] + id +
        '" class="side_panel_div"><div id="' + UserLiveFeed_side_ids[2] + id +
        '" style="width: 100%;"><div style="display: none;">' + data[1] +
        '</div><div class="side_panel_iner_div1"><img id="' + UserLiveFeed_side_ids[1] + id +
        '" alt="" class="side_panel_channel_img" src="' + data[9] +
        '" onerror="this.onerror=null;this.src=\'' + IMG_404_LOGO +
        '\';"></div><div class="side_panel_iner_div2"><div class="side_panel_new_title">' + Main_ReplaceLargeFont(data[1]) +
        '</div><div class="side_panel_new_game">' + data[3] +
        '</div></div><div class="side_panel_iner_div3"><div style="text-align: center;"><i class="icon-' +
        (!data[8] ? 'circle" style="color: red;' : 'refresh" style="') +
        ' font-size: 55%; "></i><div style="font-size: 58%;">' + Main_addCommas(data[13]) + '</div></div></div></div></div></div>';

    return div;
}

function UserLiveFeedobj_CreatFeed(id, data, ishosting, Extra_when, Extra_vodimg, force_VOD) {
    if (!data[1]) data[1] = data[6];
    var div = document.createElement('div');

    div.setAttribute('id', UserLiveFeed_ids[3] + id);
    div.setAttribute(Main_DataAttribute, JSON.stringify(data));

    div.className = 'user_feed_thumb';

    var image = (force_VOD ? Extra_vodimg : (data[0].replace("{width}x{height}", Main_VideoSize) + Main_randomimg));

    div.innerHTML = '<div id="' + UserLiveFeed_ids[0] + id + '" class="stream_thumbnail_player_feed"><div class="stream_thumbnail_live_img"><img id="' +
        UserLiveFeed_ids[1] + id + '" class="stream_img" alt="" src="' + image + '" onerror="this.onerror=null;this.src=\'' + IMG_404_VOD +
        '\';" ></div><div class="stream_thumbnail_feed_text_holder"><div class="stream_text_holder"><div style="line-height: 2vh; transform: translateY(10%);"><div id="' +
        UserLiveFeed_ids[2] + id + '" class="stream_info_live_name" style="width:' +
        (ishosting ? '99%; max-height: 2.4em; white-space: normal;' : '63.5%; white-space: nowrap; text-overflow: ellipsis;') + ' display: inline-block; overflow: hidden;">' +
        '<i class="icon-' + (data[8] ? 'refresh' : 'circle') + ' live_icon strokedeline' + (force_VOD ? ' hideimp' : '') + '" style="color: ' +
        (data[8] ? '#FFFFFF' : ishosting ? '#FED000' : 'red') + ';"></i> ' +
        (Extra_vodimg || force_VOD ? ('<div class="vodicon_text ' + (force_VOD ? '' : 'hideimp') + '" style="background: #00a94b;">&nbsp;&nbsp;VOD&nbsp;&nbsp;</div>&nbsp;') :
            '<div style="display: none;"></div>') + //empty div to prevent error when childNodes[2].classList.remove
        data[1] + '</div><div class="stream_info_live" style="width:' + (ishosting ? 0 : 36) +
        '%; float: right; text-align: right; display: inline-block; font-size: 70%;">' +
        data[5] + '</div></div><div class="' + (Extra_when ? 'stream_info_live_title_single_line' : 'stream_info_live_title') +
        '">' + Main_ReplaceLargeFont(twemoji.parse(data[2])) +
        '</div><div class="stream_info_live">' + (data[3] !== "" ? STR_PLAYING + data[3] : "") +
        '</div><div class="stream_info_live">' + data[11] + data[4] + '</div>' +
        (Extra_when ? ('<div class="stream_info_live">' + STR_WATCHED + Main_videoCreatedAtWithHM(Extra_when) + STR_BR +
            STR_UNTIL + Play_timeMs(Extra_when - (new Date(data[12]).getTime())) + '</div>') : '') +
        '</div></div></div>';

    return div;
}

function UserLiveFeedobj_CreatGameFeed(id, data) {
    var div = document.createElement('div');
    data[14] = data[2];//To make UserLiveFeed_LastPos work

    div.setAttribute('id', UserLiveFeed_ids[3] + id);
    div.setAttribute(Main_DataAttribute, JSON.stringify(data));

    div.className = 'user_feed_thumb_game';
    div.innerHTML = '<div id="' + UserLiveFeed_ids[0] + id +
        '" class="stream_thumbnail_game_feed"><div class="stream_thumbnail_feed_game"><img id="' +
        UserLiveFeed_ids[1] + id + '" class="stream_img" alt="" src="' +
        data[3].replace("{width}x{height}", Main_GameSize) + '" onerror="this.onerror=null;this.src=\'' +
        IMG_404_GAME + '\';"></div><div class="stream_thumbnail_game_feed_text_holder"><div class="stream_text_holder"><div id="' +
        UserLiveFeed_ids[2] + id + '" class="stream_info_game_name">' + data[0] + '</div>' +
        (data[1] !== '' ? '<div class="stream_info_live" style="width: 100%; display: inline-block;">' + data[1] + '</div>' : '') +
        '</div></div></div>';

    return div;
}

//Base video fun
function UserLiveFeedobj_loadDataSuccess(responseText) {
    //Main_Log('UserLiveFeedobj_loadDataSuccess');

    var response = JSON.parse(responseText),
        response_items,
        sorting = Settings_Obj_default('live_feed_sort'),
        stream, id, mArray,
        i = 0,
        itemsCount = UserLiveFeed_itemsCount[UserLiveFeedobj_UserLivePos];

    response = response.streams;
    response_items = response.length;

    if (response_items) {
        if (!UserLiveFeed_WasLiveidObject[AddUser_UsernameArray[0].id]) {
            UserLiveFeed_WasLiveidObject[AddUser_UsernameArray[0].id] = {};
            UserLiveFeed_CheckNotifycation = false;
        }

        var sorting_type1 = Settings_FeedSort[sorting][0],
            sorting_type2 = Settings_FeedSort[sorting][1],
            sorting_direction = Settings_FeedSort[sorting][2];

        if (sorting_direction) {
            //A-Z
            if (sorting_type1) {
                response.sort(function(a, b) {
                    return (a[sorting_type1][sorting_type2] < b[sorting_type1][sorting_type2] ? -1 :
                        (a[sorting_type1][sorting_type2] > b[sorting_type1][sorting_type2] ? 1 : 0));
                });
            } else {
                response.sort(function(a, b) {
                    return (a[sorting_type2] < b[sorting_type2] ? -1 :
                        (a[sorting_type2] > b[sorting_type2] ? 1 : 0));
                });
            }
        } else {
            //Z-A
            if (sorting_type1) {
                response.sort(function(a, b) {
                    return (a[sorting_type1][sorting_type2] > b[sorting_type1][sorting_type2] ? -1 :
                        (a[sorting_type1][sorting_type2] < b[sorting_type1][sorting_type2] ? 1 : 0));
                });
            } else {
                response.sort(function(a, b) {
                    return (a[sorting_type2] > b[sorting_type2] ? -1 :
                        (a[sorting_type2] < b[sorting_type2] ? 1 : 0));
                });
            }
        }

        for (i; i < response_items; i++) {
            stream = response[i];
            id = stream.channel._id;

            if (!UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos].hasOwnProperty(id)) {

                UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos][id] = itemsCount;
                mArray = ScreensObj_LiveCellArray(stream);
                UserLiveFeed_PreloadImgs.push(mArray[0]);

                //Check if was live if not notificate
                if (!UserLiveFeed_WasLiveidObject[AddUser_UsernameArray[0].id].hasOwnProperty(id)) {
                    UserLiveFeed_NotifyLiveidObject.push({
                        name: mArray[1],
                        logo: mArray[9],
                        title: Main_ReplaceLargeFont(twemoji.parse(mArray[2])),
                        game: mArray[3],
                        rerun: mArray[8],
                    });
                }

                UserLiveFeed_cell[UserLiveFeedobj_UserLivePos][itemsCount] =
                    UserLiveFeedobj_CreatFeed(
                        UserLiveFeedobj_UserLivePos + '_' + itemsCount,
                        mArray
                    );

                Sidepannel_ScroolDoc.appendChild(
                    UserLiveFeedobj_CreatSideFeed(
                        itemsCount,
                        mArray
                    )
                );

                itemsCount++;
            }
        }

        var OSInterface_Notification_end_time = OSInterface_GetNotificationTime();
        //Check if the android service notification has end notifying before update things and show notifications on js side
        if (!OSInterface_Notification_end_time || ((new Date().getTime()) > OSInterface_Notification_end_time)) {

            UserLiveFeed_WasLiveidObject[AddUser_UsernameArray[0].id] =
                JSON.parse(JSON.stringify(UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos]));

            Main_SaveLiveObjt(AddUser_UsernameArray[0].id);

        } else UserLiveFeed_NotifyLiveidObject = [];

    } else UserLiveFeedobj_Empty(UserLiveFeedobj_UserLivePos);

    // UserLiveFeed_cell[UserLiveFeedobj_UserLivePos][itemsCount] =
    //     UserLiveFeedobj_CreatFeed(UserLiveFeedobj_UserLivePos + '_' + itemsCount,
    //         [
    //             IMG_404_VIDEO,
    //             "offlineteste",
    //             "title",
    //             "game",
    //             "for 1000 Viewers",
    //             "1440p90 [EN]",
    //             "offlineteste",
    //             10000000000,
    //             true,
    //             IMG_404_LOGO,
    //             true,
    //             "Since 11:04:36&nbsp;",
    //             "2020-01-25T09:49:05Z",
    //             1000,
    //             35618666]
    //     );
    // itemsCount++;

    UserLiveFeed_itemsCount[UserLiveFeedobj_UserLivePos] = itemsCount;

    Main_setTimeout(
        function() {
            if (UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos].hasOwnProperty(UserLiveFeed_LastPos[UserLiveFeedobj_UserLivePos]))
                UserLiveFeed_FeedPosY[UserLiveFeedobj_UserLivePos] = UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos][UserLiveFeed_LastPos[UserLiveFeedobj_UserLivePos]];

            Sidepannel_Positions = JSON.parse(JSON.stringify(UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos]));
            if (Sidepannel_Positions.hasOwnProperty(UserSidePannel_LastPos[UserLiveFeedobj_UserLivePos]))
                Sidepannel_PosFeed = Sidepannel_Positions[UserSidePannel_LastPos[UserLiveFeedobj_UserLivePos]];

            Sidepannel_PreloadImgs();
            UserLiveFeed_loadDataSuccessFinish(true, UserLiveFeedobj_UserLivePos);
        },
        25
    );
}


function UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, pos) {
    var response = JSON.parse(responseText),
        total = response._total,
        response_items,
        stream, id, mArray,
        i = 0,
        itemsCount = UserLiveFeed_itemsCount[pos];

    response = response[UserLiveFeed_obj[pos].StreamType];
    response_items = response.length;

    if (response_items) {
        if (pos === UserLiveFeedobj_FeaturedPos) {
            var sorting = Settings_Obj_default('live_feed_sort');

            var sorting_type1 = Settings_FeedSort[sorting][0],
                sorting_type2 = Settings_FeedSort[sorting][1],
                sorting_direction = Settings_FeedSort[sorting][2];

            if (sorting_direction) {
                //A-Z
                if (sorting_type1) {
                    response.sort(function(a, b) {
                        return (a.stream[sorting_type1][sorting_type2] < b.stream[sorting_type1][sorting_type2] ? -1 :
                            (a.stream[sorting_type1][sorting_type2] > b.stream[sorting_type1][sorting_type2] ? 1 : 0));
                    });
                } else {
                    response.sort(function(a, b) {
                        return (a.stream[sorting_type2] < b.stream[sorting_type2] ? -1 :
                            (a.stream[sorting_type2] > b.stream[sorting_type2] ? 1 : 0));
                    });
                }
            } else {
                //Z-A
                if (sorting_type1) {
                    response.sort(function(a, b) {
                        return (a.stream[sorting_type1][sorting_type2] > b.stream[sorting_type1][sorting_type2] ? -1 :
                            (a.stream[sorting_type1][sorting_type2] < b.stream[sorting_type1][sorting_type2] ? 1 : 0));
                    });
                } else {
                    response.sort(function(a, b) {
                        return (a.stream[sorting_type2] > b.stream[sorting_type2] ? -1 :
                            (a.stream[sorting_type2] < b.stream[sorting_type2] ? 1 : 0));
                    });
                }
            }
        }

        for (i; i < response_items; i++) {
            stream = UserLiveFeed_obj[pos].cell(response[i]);
            id = stream.channel._id;
            if (!UserLiveFeed_idObject[pos].hasOwnProperty(id)) {

                UserLiveFeed_idObject[pos][id] = itemsCount;
                mArray = ScreensObj_LiveCellArray(stream);

                UserLiveFeed_cell[pos][itemsCount] =
                    UserLiveFeedobj_CreatFeed(
                        pos + '_' + itemsCount,
                        mArray
                    );

                itemsCount++;
            }
        }

    } else UserLiveFeedobj_Empty(pos);

    UserLiveFeed_itemsCount[pos] = itemsCount;

    if (UserLiveFeed_obj[pos].HasMore) {

        UserLiveFeed_obj[pos].offset = UserLiveFeed_cell[pos].length;
        UserLiveFeed_obj[pos].MaxOffset = total;

        if (!response_items) UserLiveFeed_obj[pos].dataEnded = true;
        else if (typeof UserLiveFeed_obj[pos].MaxOffset === 'undefined') {
            if (response_items < 90) UserLiveFeed_obj[pos].dataEnded = true;
        } else {
            if (UserLiveFeed_obj[pos].offset >= total) UserLiveFeed_obj[pos].dataEnded = true;
        }
    }

    if (UserLiveFeed_obj[pos].loadingMore) {
        UserLiveFeed_obj[pos].loadingMore = false;
        if (pos === UserLiveFeed_FeedPosX) UserLiveFeed_CounterDialog(UserLiveFeed_FeedPosY[pos], UserLiveFeed_itemsCount[pos]);
    } else {
        Main_setTimeout(
            function() {

                if (UserLiveFeed_idObject[pos].hasOwnProperty(UserLiveFeed_LastPos[pos]))
                    UserLiveFeed_FeedPosY[pos] = UserLiveFeed_idObject[pos][UserLiveFeed_LastPos[pos]];

                UserLiveFeed_loadDataSuccessFinish(false, pos);
            },
            25
        );
    }
}

function UserLiveFeedobj_loadDataUserHostSuccess(responseText) {
    var response = JSON.parse(responseText).hosts,
        response_items = response.length,
        stream, id,
        sorting = Settings_Obj_default('live_feed_sort'),
        i = 0,
        itemsCount = UserLiveFeed_itemsCount[UserLiveFeedobj_UserHostPos];

    if (response.length) {

        var sorting_type1 = Settings_FeedSortHost[sorting][0],
            sorting_type2 = Settings_FeedSortHost[sorting][1],
            sorting_direction = Settings_FeedSortHost[sorting][2];

        if (sorting_direction) {
            //A-Z
            if (sorting_type1) {
                response.sort(function(a, b) {
                    return (a[sorting_type2] < b[sorting_type2] ? -1 :
                        (a[sorting_type2] > b[sorting_type2] ? 1 : 0));
                });
            } else {
                response.sort(function(a, b) {
                    return (a.target[sorting_type2] < b.target[sorting_type2] ? -1 :
                        (a.target[sorting_type2] > b.target[sorting_type2] ? 1 : 0));
                });
            }
        } else {
            //Z-A
            if (sorting_type1) {
                response.sort(function(a, b) {
                    return (a[sorting_type2] > b[sorting_type2] ? -1 :
                        (a[sorting_type2] < b[sorting_type2] ? 1 : 0));
                });
            } else {
                response.sort(function(a, b) {
                    return (a.target[sorting_type2] > b.target[sorting_type2] ? -1 :
                        (a.target[sorting_type2] < b.target[sorting_type2] ? 1 : 0));
                });
            }
        }

        for (i; i < response_items; i++) {
            stream = response[i];
            id = stream.target._id;

            if (!UserLiveFeed_idObject[UserLiveFeedobj_UserHostPos].hasOwnProperty(id)) {

                UserLiveFeed_idObject[UserLiveFeedobj_UserHostPos][id] = itemsCount;

                UserLiveFeed_cell[UserLiveFeedobj_UserHostPos][itemsCount] =
                    UserLiveFeedobj_CreatFeed(
                        UserLiveFeedobj_UserHostPos + '_' + itemsCount,
                        ScreensObj_HostCellArray(stream),
                        true
                    );

                itemsCount++;
            }
        }

    } else UserLiveFeedobj_Empty(UserLiveFeedobj_UserHostPos);

    UserLiveFeed_itemsCount[UserLiveFeedobj_UserHostPos] = itemsCount;

    Main_setTimeout(
        function() {

            if (UserLiveFeed_idObject[UserLiveFeedobj_UserHostPos].hasOwnProperty(UserLiveFeed_LastPos[UserLiveFeedobj_UserHostPos]))
                UserLiveFeed_FeedPosY[UserLiveFeedobj_UserHostPos] = UserLiveFeed_idObject[UserLiveFeedobj_UserHostPos][UserLiveFeed_LastPos[UserLiveFeedobj_UserHostPos]];

            UserLiveFeed_loadDataSuccessFinish(false, UserLiveFeedobj_UserHostPos);
        },
        25
    );
}
//Base video fun end

//Base game fun
function UserLiveFeedobj_loadDataBaseGamesSuccess(responseText, pos, type) {
    var response = JSON.parse(responseText),
        total = response._total,
        response_items,
        cell, game,
        i = 0,
        itemsCount = UserLiveFeed_itemsCount[pos];

    response = response[type];
    response_items = response.length;

    if (response_items) {

        if (pos === UserLiveFeedobj_UserGamesPos) {
            var sorting = Settings_Obj_default('live_feed_sort');

            var sorting_type1 = Settings_FeedSortGames[sorting][0],
                sorting_type2 = Settings_FeedSortGames[sorting][1],
                sorting_direction = Settings_FeedSortGames[sorting][2];

            if (sorting_direction) {
                //A-Z
                if (sorting_type1) {
                    response.sort(function(a, b) {
                        return (a[sorting_type1][sorting_type2] < b[sorting_type1][sorting_type2] ? -1 :
                            (a[sorting_type1][sorting_type2] > b[sorting_type1][sorting_type2] ? 1 : 0));
                    });
                } else {
                    response.sort(function(a, b) {
                        return (a[sorting_type2] < b[sorting_type2] ? -1 :
                            (a[sorting_type2] > b[sorting_type2] ? 1 : 0));
                    });
                }
            } else {
                //Z-A
                if (sorting_type1) {
                    response.sort(function(a, b) {
                        return (a[sorting_type1][sorting_type2] > b[sorting_type1][sorting_type2] ? -1 :
                            (a[sorting_type1][sorting_type2] < b[sorting_type1][sorting_type2] ? 1 : 0));
                    });
                } else {
                    response.sort(function(a, b) {
                        return (a[sorting_type2] > b[sorting_type2] ? -1 :
                            (a[sorting_type2] < b[sorting_type2] ? 1 : 0));
                    });
                }
            }
        }

        for (i; i < response_items; i++) {
            cell = response[i];
            game = cell.game;

            if (!UserLiveFeed_idObject[pos].hasOwnProperty(game._id)) {

                UserLiveFeed_idObject[pos][game._id] = itemsCount;

                UserLiveFeed_cell[pos][itemsCount] =
                    UserLiveFeedobj_CreatGameFeed(
                        pos + '_' + itemsCount,
                        [
                            game.name,//0
                            Main_addCommas(cell.channels) + STR_SPACE + STR_CHANNELS + STR_BR + STR_FOR +
                            Main_addCommas(cell.viewers) + STR_SPACE + STR_VIEWER,//1
                            game._id,//2
                            game.box.template//3
                        ]
                    );

                itemsCount++;
            }
        }
    } else UserLiveFeedobj_Empty(pos);

    UserLiveFeed_itemsCount[pos] = itemsCount;

    if (UserLiveFeed_obj[pos].HasMore) {
        UserLiveFeed_obj[pos].offset = UserLiveFeed_cell[pos].length;
        UserLiveFeed_obj[pos].MaxOffset = total;
        if (UserLiveFeed_obj[pos].offset >= total || !response_items) UserLiveFeed_obj[pos].dataEnded = true;
    }

    if (UserLiveFeed_obj[pos].loadingMore) {
        UserLiveFeed_obj[pos].loadingMore = false;
        if (pos === UserLiveFeed_FeedPosX) UserLiveFeed_CounterDialog(UserLiveFeed_FeedPosY[pos], UserLiveFeed_itemsCount[pos]);
    } else {
        Main_setTimeout(
            function() {

                if (UserLiveFeed_idObject[pos].hasOwnProperty(UserLiveFeed_LastPos[pos]))
                    UserLiveFeed_FeedPosY[pos] = UserLiveFeed_idObject[pos][UserLiveFeed_LastPos[pos]];

                UserLiveFeed_loadDataSuccessFinish(false, pos);
            },
            25
        );
    }
}
//Base game fun end

function UserLiveFeedobj_CheckOffset(pos) {
    if ((UserLiveFeed_obj[pos].offset >= 900) ||
        ((typeof UserLiveFeed_obj[pos].MaxOffset !== 'undefined') &&
            UserLiveFeed_obj[pos].offset &&
            (UserLiveFeed_obj[pos].offset + 100) > UserLiveFeed_obj[pos].MaxOffset))
        UserLiveFeed_obj[pos].dataEnded = true;
}