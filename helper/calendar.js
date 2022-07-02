import qs from 'qs';

function getGoogleCalendarUrl(
    text,
    date_start,
    date_end,
    details
) {

    let url_base = 'https://calendar.google.com/calendar/r/eventedit';
    let url_params = {
        text,
        dates: `${date_start}/${date_end}`,
        details
    };
    let url = `${url_base}?${qs.stringify(url_params)}`;
    return url;
}


module.exports = {
    getGoogleCalendarUrl : getGoogleCalendarUrl
}