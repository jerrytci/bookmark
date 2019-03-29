import _ from 'lodash'
import __ from '@/common/util/i18n'

const cate = {
  BEHAVIOUR: 'behaviour',
};

export const optionsList = [
  {
    cate: cate.BEHAVIOUR, name: 'browserAction', desc: __('opt_desc_browserAction'), type: String, default: 'menu_show_list',
    items: [
      {value: 'menu_show_list', label: __('menu_show_list'),},
      {value: 'menu_store_left_tabs', label: __('menu_store_left_tabs'),},
      {value: 'menu_store_right_tabs', label: __('menu_store_right_tabs'),},
      {value: 'menu_store_selected_tabs', label: __('menu_store_selected_tabs'),},
      {value: 'menu_store_twoside_tabs', label: __('menu_store_twoside_tabs'),},
      {value: 'menu_store_all_tabs', label: __('menu_store_all_tabs'),},
      {value: 'menu_store_all_in_all_windows', label: __('menu_store_all_in_all_windows'),},
    ],
  },
  /*storeTabs引用到*/
  {cate: cate.BEHAVIOUR, name: 'addHistory', desc: __('opt_desc_addHistory'), type: Boolean, default: true,},
  {cate: cate.BEHAVIOUR, name: 'ignorePinned', desc: __('opt_desc_ignorePinned'), type: Boolean, default: true,},
  {cate: cate.BEHAVIOUR, name: 'open_in_new_window', desc: __('opt_desc_open_in_new_window'), type: Boolean, default: true,},
];

/*根据key分类,value就是key所在的对象; mapValues返回被设置 value*/
/*{key(name): value(default), ...}*/
const getDefaultOptions = () => _.mapValues(_.keyBy(optionsList, 'name'), i => i.default);

export default {getDefaultOptions, optionsList}
