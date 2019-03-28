import moment from 'moment'
import __ from './i18n'
moment.locale(__('@@ui_locale'));

const formatTime = time => {
  if (Date.now() - time < 3600E3) return moment(time).fromNow();
  formatTimeForTitle(time)
};

const formatTimeForTitle = time => {
  const withYear = !moment(time).isSame(new Date(), 'year');
  return withYear
    ? moment(time).format('MMMM Do YYYY, h:mm:ss a')
    : moment(time).format('MMMM Do, h:mm:ss a')
};

export default {
  formatTime,
  formatTimeForTitle
}
