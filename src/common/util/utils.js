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

const asyncWorker = promise => {
  return promise.then(res => [null, res]).catch(err => [err])
}

const isChromeUrl = url => {
  return /^chrome/.test(url);
}

const getUrlDomain = url => {
  try {
    return new URL(url).hostname;
  } catch(err) {
    return '';
  }
}

const getDomain = url => {
  return isChromeUrl(url) ? '' : getUrlDomain(url);
}

let fDomain = ["com","net","gov","org","ac","edu","co","biz","info"]
const getMainDomain = domain => {
  let isSubDomain = fDomain.filter((demo)=>{
    return domain.split('.').slice(-2)[0] === demo;
  })
  console.log(isSubDomain);
  if(isSubDomain.length > 0){
    return domain.split('.').slice(-3).join('.');
  }
  return domain.split('.').slice(-2).join('.');
}

export default {
  formatTime,
  formatTimeForTitle,
  asyncWorker,
  getDomain,
  getMainDomain,
  getUrlDomain
}
