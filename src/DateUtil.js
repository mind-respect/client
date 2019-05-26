import {formatRelative} from 'date-fns'
import {fr} from 'date-fns/locale'
import I18n from '@/I18n'

const DateUtil = {};
DateUtil.fromNow = function (date) {
    let options = I18n.getLocale() === "fr" ? {
        locale: fr
    } : {};
    return formatRelative(date, new Date(), options);
};
export default DateUtil;