import _ from 'lodash'
import __ from '@/common/util/i18n'

const cate = {
  BEHAVIOUR: 'behaviour',
};

export const optionsList = [
  {
    cate: cate.BEHAVIOUR, name: 'browserAction', desc: __('opt_desc_browserAction'), type: String, default: 'show-list',
    items: [
      {value: 'popup', label: __('opt_label_popup'),},
      {value: 'store-selected', label: __('opt_label_store_selected'),},
      {value: 'store-all', label: __('opt_label_store_all'),},
      {value: 'show-list', label: __('opt_label_show_list'),},
      {value: 'none', label: __('opt_label_none'),},
    ],
  },
  {cate: cate.BEHAVIOUR, name: 'pageContext', desc: __('opt_desc_pageContext'), type: Boolean, default: true,},

  /*storeTabs引用到*/
  {cate: cate.BEHAVIOUR, name: 'ignorePinned', desc: __('opt_desc_ignorePinned'), type: Boolean, default: false,},
  {cate: cate.BEHAVIOUR, name: 'pinNewList', desc: __('opt_desc_pinNewList'), type: Boolean, default: false,},
  {cate: cate.BEHAVIOUR, name: 'addHistory', desc: __('opt_desc_addHistory'), type: Boolean, default: true,},
];

/*根据key分类,value就是key所在的对象; mapValues返回被设置 value*/
/*{key(name): value(default), ...}*/
const getDefaultOptions = () => _.mapValues(_.keyBy(optionsList, 'name'), i => i.default);

export default {getDefaultOptions, optionsList}
