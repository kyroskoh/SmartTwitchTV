//Spacing for reease maker not trow erros frm jshint
var UserLiveFeed_loadingData = false;
var UserLiveFeed_loadingDataId;
var UserLiveFeed_loadingDataTry = 0;
var UserLiveFeed_loadingDataTimeout = 3500;
var UserLiveFeed_loadChannelOffsset = 0;
var UserLiveFeed_loadingDataTryMax = 5;
var UserLiveFeed_dataEnded = false;
var UserLiveFeed_followerChannels = '';
var UserLiveFeed_idObject = [];
var UserLiveFeed_status = [];
var UserLiveFeed_LastPos = [];
var UserSidePannel_LastPos = [];
var UserLiveFeed_token = null;
var UserLiveFeed_Feedid;
var UserLiveFeed_FocusClass = 'feed_thumbnail_focused';
var UserLiveFeed_PreventAddfocus = false;
var UserLiveFeed_PreventHide = false;

var UserLiveFeed_CheckNotifycation = false;
var UserLiveFeed_WasLiveidObject = {};
var UserLiveFeed_NotifyLiveidObject = [];
var UserLiveFeed_PreloadImgs = [];
var UserLiveFeed_Notify = true;
var UserLiveFeed_NotifyRunning = false;
var UserLiveFeed_NotifyTimeout = 3000;

var UserLiveFeed_FeedPosY = [];
var UserLiveFeed_FeedPosX = 0;
var UserLiveFeed_itemsCount = [];

var UserLiveFeed_ids = ['ulf_thumbdiv', 'ulf_img', 'ulf_infodiv', 'ulf_displayname', 'ulf_streamtitle', 'ulf_streamgame', 'ulf_viwers', 'ulf_quality', 'ulf_cell', 'ulempty_', 'user_live_scroll'];

var UserLiveFeed_side_ids = ['usf_thumbdiv', 'usf_img', 'usf_infodiv', 'usf_displayname', 'usf_streamtitle', 'usf_streamgame', 'usf_viwers', 'usf_quality', 'usf_cell', 'ulempty_', 'user_live_scroll'];

function UserLiveFeed_StartLoad(PreventAddfocus) {
    if (AddUser_UserIsSet()) {
        UserLiveFeed_clearHideFeed();

        UserLiveFeed_CounterDialogRst();
        Main_innerHTML('feed_end', 'Live Feed');
        UserLiveFeed_PreventAddfocus = PreventAddfocus;
        Main_ShowElement('dialog_loading_feed');
        UserLiveFeedobj_loadDataPrepare();
        UserLiveFeedobj_CheckToken();
    }
}


function UserLiveFeed_CounterDialogRst() {
    Main_empty('feed_counter');
}

function UserLiveFeed_CounterDialog(pos, total) {
    if (total > 0) Main_textContent('feed_counter', (pos + 1) + '/' + (total));
    else UserLiveFeed_CounterDialogRst();
}

function UserLiveFeed_loadDataSuccessFinish(ShowNotifications, pos) {
    UserLiveFeed_loadingData = false;
    UserLiveFeed_status[pos] = true;
    Main_ready(function() {
        Main_HideElement('dialog_loading_feed');
        Main_HideElement('dialog_loading_side_feed');
        Sidepannel_AddFocusFeed(true);
        UserLiveFeed_FeedAddFocus(true, pos);
        window.setTimeout(Sidepannel_PreloadImgs, 10);

        if (ShowNotifications) {
            //The app just started or user change don't nottify
            if (UserLiveFeed_CheckNotifycation) UserLiveFeedobj_LiveNotification();
            else {
                UserLiveFeed_NotifyLiveidObject = [];
                UserLiveFeed_CheckNotifycation = true;
            }
        }
    });
}

function UserLiveFeed_GetSize() {
    return document.getElementById('user_feed_scroll').getElementsByClassName('user_feed_thumb').length;
}

function UserLiveFeed_CreatFeed(id, data) {
    var div = document.createElement('div');
    div.setAttribute('id', UserLiveFeed_ids[8] + id);
    div.setAttribute(Main_DataAttribute, JSON.stringify(data));

    div.className = 'user_feed_thumb';
    div.innerHTML = '<div id="' + UserLiveFeed_ids[0] + id + '" class="stream_thumbnail_player_feed" >' +
        '<div class="stream_thumbnail_live_img"><img id="' + UserLiveFeed_ids[1] + id + '" alt="" class="stream_img" src="' + data[0].replace("{width}x{height}", Main_VideoSize) +
        Main_randomimg + '" onerror="this.onerror=null;this.src=\'' + IMG_404_VIDEO + '\';"></div>' +
        '<div id="' + UserLiveFeed_ids[2] + id + '" class="player_live_feed_text"><span class="stream_spam_text_holder">' +
        '<div style="line-height: 1.6ch;"><div id="' + UserLiveFeed_ids[3] + id +
        '" class="stream_info_live_name" style="width: 63%; display: inline-block;">' + Main_ReplaceLargeFont(data[1]) + '</div>' +
        '<div "class="stream_info_live" style="width:36%; float: right; text-align: right; display: inline-block; font-size: 75%; ">' +
        '<i class="icon-' + (!data[8] ? 'circle" style="color: red;' : 'refresh" style="') + ' font-size: 75%; "></i>' +
        STR_SPACE + Main_addCommas(data[13]) + '</div></div><div id="' + UserLiveFeed_ids[4] + id +
        '"class="stream_info_live_title">' + Main_ReplaceLargeFont(twemoji.parse(data[2])) + '</div><div id="' +
        UserLiveFeed_ids[5] + id + '"class="stream_info_live">' + data[3] + '</div></span></div></div>';

    return div;
}

function UserLiveFeed_isFeedShow() {
    return document.getElementById('user_feed').className.indexOf('user_feed_hide') === -1;
}

function UserLiveFeed_ShowFeed(PreventAddfocus) {
    UserLiveFeedobj_ShowFeed(PreventAddfocus);
}

function UserLiveFeed_Show(notransition) {
    if (notransition) {
        var doc = document.getElementById('user_feed');
        doc.style.transition = 'none';
        doc.classList.remove('user_feed_hide');
        Main_ready(function() {
            if (Settings_Obj_default("app_animations")) doc.style.transition = '';
        });
    } else Main_RemoveClass('user_feed', 'user_feed_hide');
}

function UserLiveFeed_Hide(notransition) {
    if (notransition) {
        var doc = document.getElementById('user_feed');
        doc.style.transition = 'none';
        doc.classList.add('user_feed_hide');
        Main_ready(function() {
            if (Settings_Obj_default("app_animations")) doc.style.transition = '';
        });
    } else Main_AddClass('user_feed', 'user_feed_hide');
}

function UserLiveFeed_ResetFeedId() {
    UserLiveFeed_clearHideFeed();
    if (!UserLiveFeed_PreventHide) UserLiveFeed_setHideFeed();
}

function UserLiveFeed_clearHideFeed() {
    window.clearTimeout(UserLiveFeed_Feedid);
}

function UserLiveFeed_setHideFeed() {
    if (UserLiveFeed_isFeedShow()) UserLiveFeed_Feedid = window.setTimeout(UserLiveFeed_Hide, 5500);
}

function UserLiveFeed_FeedRefresh(PreventAddfocus) {
    UserLiveFeed_clearHideFeed();
    if (!UserLiveFeed_loadingData) UserLiveFeed_StartLoad(PreventAddfocus);
    else {
        window.clearTimeout(UserLiveFeed_loadingDataId);
        UserLiveFeed_loadingDataId = window.setTimeout(function() {
            UserLiveFeed_loadingData = false;
        }, 15000);
    }
}

function UserLiveFeed_FeedAddFocus(skipAnimation, pos) {
    UserLiveFeed_ResetFeedId();
    if (!UserLiveFeed_ThumbNull(UserLiveFeed_FeedPosY[pos], UserLiveFeed_ids[0])) return;

    if (!UserLiveFeed_PreventAddfocus) {
        Main_AddClass(UserLiveFeed_ids[0] + UserLiveFeed_FeedPosY[pos], UserLiveFeed_FocusClass);
    } else UserLiveFeed_PreventAddfocus = false;

    UserLiveFeed_FeedSetPos(skipAnimation, pos);
    UserLiveFeed_CounterDialog(UserLiveFeed_FeedPosY[pos], UserLiveFeed_itemsCount[pos]);
}

function UserLiveFeed_FeedRemoveFocus(pos) {
    if (UserLiveFeed_ThumbNull(UserLiveFeed_FeedPosY[pos], UserLiveFeed_ids[0]))
        Main_RemoveClass(UserLiveFeed_ids[0] + UserLiveFeed_FeedPosY[pos], UserLiveFeed_FocusClass);
}

function UserLiveFeed_FeedGetPos(pos) {
    var position = 0;

    if (UserLiveFeed_FeedPosY[pos] < 3) position = 2.5;
    else if (UserLiveFeed_ThumbNull((UserLiveFeed_FeedPosY[pos] + 2), UserLiveFeed_ids[0]))
        position = (document.getElementById(UserLiveFeed_ids[8] + (UserLiveFeed_FeedPosY[pos] - 2)).offsetLeft * -1);
    else if (UserLiveFeed_ThumbNull((UserLiveFeed_FeedPosY[pos] + 1), UserLiveFeed_ids[0]))
        position = (document.getElementById(UserLiveFeed_ids[8] + (UserLiveFeed_FeedPosY[pos] - 3)).offsetLeft * -1);
    else position = (document.getElementById(UserLiveFeed_ids[8] + (UserLiveFeed_FeedPosY[pos] - (UserLiveFeed_FeedPosY[UserLiveFeed_FeedPosX] > 3 ? 4 : 3))).offsetLeft * -1);

    return position;
}

function UserLiveFeed_FeedSetPos(skipAnimation, pos) {
    var position = UserLiveFeed_FeedGetPos(pos);
    var doc = document.getElementById('user_feed_scroll');

    if (!skipAnimation && Screens_ChangeFocusAnimationFinished && Screens_SettingDoAnimations &&
        !Screens_ChangeFocusAnimationFast) {
        Screens_ChangeFocusAnimationFinished = false;
        Screens_ChangeFocusAnimationFast = true;

        doc.style.transition = '';
        doc.classList.add('user_feed_scroll_ani');

        window.setTimeout(function() {
            Screens_ChangeFocusAnimationFinished = true;
        }, 200); //Same value as user_feed_scroll_ani
    } else {
        if (skipAnimation) Screens_ChangeFocusAnimationFast = false;
        doc.style.transition = 'none';
        doc.classList.remove('user_feed_scroll_ani');
    }

    if (position) doc.style.left = (position / BodyfontSize) + "em";
}

function UserLiveFeed_ThumbNull(y, thumbnail) {
    return document.getElementById(thumbnail + y) !== null;
}

function UserLiveFeed_SetFeedPicText() {
    Main_innerHTML('icon_feed_refresh', '<div class="strokedelinebig" style="vertical-align: middle; display: inline-block;"><i class="icon-refresh" style="color: #FFFFFF; font-size: 115%; "></i></div><div class="strokedelinebig" style="vertical-align: middle; display: inline-block">' + STR_SPACE + STR_REFRESH + ':' + STR_UP + STR_SPACE + STR_SPACE + '</div><div class="strokedelinebig" style="vertical-align: middle; display: inline-block;"><i class="icon-pp" style="color: #FFFFFF; font-size: 115%; "></i></div><div class="strokedelinebig" style="vertical-align: middle; display: inline-block">' + STR_SPACE + STR_PICTURE_LIVE_FEED + '</div>');
}

function UserLiveFeed_Unset() {
    Main_IconLoad('icon_feed_refresh', 'icon-refresh', STR_REFRESH + ':' + STR_UP);
}

function UserLiveFeed_SetHoldUp() {
    Main_IconLoad('icon_feed_refresh', 'icon-refresh', STR_REFRESH + ':' + STR_HOLD_UP);
}

function UserLiveFeed_KeyRightLeft(Adder) {
    if (Screens_ChangeFocusAnimationFinished && !UserLiveFeed_loadingData) {

        var NextPos = UserLiveFeed_FeedPosY[UserLiveFeed_FeedPosX] + Adder;
        if (NextPos > (UserLiveFeed_GetSize() - 1) || NextPos < 0) return;

        UserLiveFeed_FeedRemoveFocus(UserLiveFeed_FeedPosX);
        UserLiveFeed_FeedPosY[UserLiveFeed_FeedPosX] = NextPos;
        UserLiveFeed_FeedAddFocus(false, UserLiveFeed_FeedPosX);
    }
}
