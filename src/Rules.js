import I18n from '@/I18n'

export default {
    required: function (value) {
        return !!value || I18n.i18next.t('required')
    },
    email: function (value) {
        /* eslint-disable */
        if (!value) {
            return true
        }
        var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || I18n.i18next.t('invalidEmail')
    },
    min8Char: function (value) {
        if (!value) {
            return true;
        }
        return value.length >= 8 || I18n.i18next.t('min8Char');
    }
}
