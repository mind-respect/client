/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

const ShareLevel = {
    "PRIVATE": "PRIVATE",
    "FRIENDS": "FRIENDS",
    "PUBLIC_WITH_LINK": "PUBLIC_WITH_LINK",
    "PUBLIC": "PUBLIC"
};
ShareLevel.isPublic = function (shareLevel) {
    return shareLevel === ShareLevel.PUBLIC || shareLevel === ShareLevel.PUBLIC_WITH_LINK;
};

ShareLevel.getIcon = function (shareLevel) {
    switch (shareLevel) {
        case ShareLevel.PRIVATE :
            return "lock";
        case ShareLevel.PUBLIC:
            return "public";
        case ShareLevel.PUBLIC_WITH_LINK:
            return "link";
        case ShareLevel.FRIENDS :
            return "people";
    }
};
ShareLevel.getIndex = function (shareLevel) {
    switch (shareLevel) {
        case "PRIVATE":
            return 1;
        case "FRIENDS" :
            return 2;
        case "PUBLIC_WITH_LINK" :
            return 3;
        case "PUBLIC" :
            return 4;
    }
};

export default ShareLevel;
