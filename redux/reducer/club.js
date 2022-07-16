import { normalize } from 'normalizr';
import Immutable from 'immutable';
import {httpRequest} from 'helper/http'
import { getHashByData,removeValueEmpty} from 'helper/common'


import { clubListSchema ,clubSchema } from 'redux/schema/index'


export const BEFORE_LOAD_RECOMMEND_CLUB_LIST = 'BEFORE_LOAD_RECOMMEND_CLUB_LIST'
export const LOAD_RECOMMEND_CLUB_LIST_SUCCESS = 'LOAD_RECOMMEND_CLUB_LIST_SUCCESS'
export const LOAD_RECOMMEND_CLUB_LIST_FAILURE = 'LOAD_RECOMMEND_CLUB_LIST_FAILURE'

export function loadRecommendClubList(cond) {
    var hash = getHashByData(cond)
    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_RECOMMEND_CLUB_LIST', 'LOAD_RECOMMEND_CLUB_LIST_SUCCESS', 'LOAD_RECOMMEND_CLUB_LIST_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => !state.getIn(['club','recommend',hash,'is_fetching']),
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'method'  : 'GET',
                'url'     : '/v1/club/public_list',
                'data'    : cond
            })
        },

        data_format : (result) => {
            var output = normalize(result.data.data, clubListSchema)
            output['total'] = result.data.total
            return output
        },

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    true
        },
        payload: {
            hash  : hash
        }
    };
}


export const BEFORE_LOAD_WHITELIST_CLUB_LIST = 'BEFORE_LOAD_WHITELIST_CLUB_LIST'
export const LOAD_WHITELIST_CLUB_LIST_SUCCESS = 'LOAD_WHITELIST_CLUB_LIST_SUCCESS'
export const LOAD_WHITELIST_CLUB_LIST_FAILURE = 'LOAD_WHITELIST_CLUB_LIST_FAILURE'


export function loadWhitelistClubList(cond) {
    var hash = getHashByData(cond)
    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_WHITELIST_CLUB_LIST', 'LOAD_WHITELIST_CLUB_LIST_SUCCESS', 'LOAD_WHITELIST_CLUB_LIST_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => !state.getIn(['club','whitelist_list',hash,'is_fetching']),
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'method'  : 'GET',
                'url'     : '/v1/club/public_list_with_whitelist',
                'data'    : cond
            })
        },

        data_format : (result) => {
            var output = normalize(result.data.data, clubListSchema)
            output['total'] = result.data.total
            return output
        },

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    true
        },
        payload: {
            hash  : hash
        }
    };
}



export const BEFORE_LOAD_CLUB_LIST = 'BEFORE_LOAD_CLUB_LIST'
export const LOAD_CLUB_LIST_SUCCESS = 'LOAD_CLUB_LIST_SUCCESS'
export const LOAD_CLUB_LIST_FAILURE = 'LOAD_CLUB_LIST_FAILURE'


export function loadClubList(condition) {

    let {login_user_id} = condition;


    condition = removeValueEmpty(condition);
    delete condition.login_user_id;
    var hash = getHashByData(condition)


    console.log('debug03,hash',hash)
    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_CLUB_LIST', 'LOAD_CLUB_LIST_SUCCESS', 'LOAD_CLUB_LIST_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => !state.getIn(['club','list',hash,'is_fetching']),
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'method'  : 'GET',
                'url'     : '/v1/club/public_list',
                'data'    : condition
            })
        },

        data_format : (result) => {
            var output = normalize(result.data.data, clubListSchema)
            output['total'] = result.data.total
            return output
        },


        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    false
        },
        payload: {
            hash : hash,
        }
    };
}



//载入
export const BEFORE_LOAD_CLUB  = 'BEFORE_LOAD_CLUB'
export const LOAD_CLUB_SUCCESS = 'LOAD_CLUB_SUCCESS'
export const LOAD_CLUB_FAILURE = 'LOAD_CLUB_FAILURE'

export function loadClubDetail(cond) {
    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_CLUB', 'LOAD_CLUB_SUCCESS', 'LOAD_CLUB_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => { 
            let check;
            if (cond.name) {
                check = state.getIn(['club','map_name',cond.name,'is_fetching'])
            }else {
                check = state.getIn(['club','map_id',cond.id,'is_fetching'])
            }
            return !check
        },
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'url'    : '/v1/club/detail',
                'method' : 'GET', 
                'data'   : cond
            })
        },
        data_format : (data) => normalize(data.data, clubSchema),

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    false
        },
        payload: {
            'name' : cond.name,
            'id'   : cond.id 
        }
    };
}


export function initClub(club_id,response) {
    console.log('debug008,call init club');
    return {
        type             : LOAD_CLUB_SUCCESS,
        payload : {
            club_id         : club_id,
            response        : response
        }
    }
}




export function reducer(state = Immutable.fromJS({
    'map_name' : {},
    'map_id'   : {},
    'my_list' : {},
    'whitelist_list' : {},
    'map'   : {},
    'key'   : {}
}), action) {
    switch (action.type) {


        case BEFORE_LOAD_CLUB:
            if (action.payload.name) {
                return state.setIn(['map_name',action.payload.name,'is_fetching'],true)
            }else {
                return state.setIn(['map_id',action.payload.id,'is_fetching'],true)
            }

        case LOAD_CLUB_SUCCESS:
            if (action.payload.name) {
                return state.updateIn(['map_name',action.payload.name],(list_data)=>{
                    return list_data.merge({
                        'is_fetching' : false,
                        'result'     : action.payload.response.result,
                        'is_fetched' : true
                    })
                })
            }else {
                return state.updateIn(['map_id',action.payload.id],(list_data)=>{
                    return list_data.merge({
                        'is_fetching' : false,
                        'result'     : action.payload.response.result,
                        'is_fetched' : true
                    })
                })
            }

        case LOAD_CLUB_FAILURE:
            if (action.payload.name) {
                return state.updateIn(['map_name',action.payload.name],(list_data)=>{
                    return list_data.merge({
                        'is_fetching' : false,
                        'result'     : null,
                        'is_fetched' : true
                    })
                })
            }else {
                return state.updateIn(['map_id',action.payload.id],(list_data)=>{
                    return list_data.merge({
                        'is_fetching' : false,
                        'result'     : null,
                        'is_fetched' : true
                    })
                })
            }

       case BEFORE_LOAD_CLUB_LIST:
            if (!state.getIn(['list',action.payload.hash])) {
                state = state.setIn(['list',action.payload.hash,'list'],Immutable.List([]));
            }
            return state
            .setIn(['list',action.payload.hash,'is_fetching'],true)
            .setIn(['list',action.payload.hash,'is_fetched'],false)

        case LOAD_CLUB_LIST_SUCCESS:
            return state.setIn(['list',action.payload.hash,'is_fetching'],false)
            .setIn(['list',action.payload.hash,'is_fetched'],true)
            .setIn(['list',action.payload.hash,'list'],Immutable.List(action.payload.response.result))
            .setIn(['list',action.payload.hash,'total'],action.payload.response.total)

        case LOAD_CLUB_LIST_FAILURE:
            return state.setIn(['list',action.payload.hash,'is_fetching'],false)
            .setIn(['list',action.payload.hash,'is_fetched'],false)

        case BEFORE_LOAD_WHITELIST_CLUB_LIST:
            if (!state.getIn(['whitelist_list',action.payload.hash])) {
                state = state.setIn(['whitelist_list',action.payload.hash,'list'],Immutable.List([]));
            }
            return state
            .setIn(['whitelist_list',action.payload.hash,'is_fetching'],true)
            .setIn(['whitelist_list',action.payload.hash,'is_fetched'],false)

        case LOAD_WHITELIST_CLUB_LIST_SUCCESS:
            return state.setIn(['whitelist_list',action.payload.hash,'is_fetching'],false)
            .setIn(['whitelist_list',action.payload.hash,'is_fetched'],true)
            .setIn(['whitelist_list',action.payload.hash,'list'],Immutable.List(action.payload.response.result))
            .setIn(['whitelist_list',action.payload.hash,'total'],action.payload.response.total)

        case LOAD_WHITELIST_CLUB_LIST_FAILURE:
            return state.setIn(['whitelist_list',action.payload.hash,'is_fetching'],false)
            .setIn(['whitelist_list',action.payload.hash,'is_fetched'],false)

        case BEFORE_LOAD_RECOMMEND_CLUB_LIST:
            if (!state.getIn(['recommend_list',action.payload.hash])) {
                state = state.setIn(['recommend_list',action.payload.hash,'list'],Immutable.List([]));
            }
            return state
            .setIn(['recommend_list',action.payload.hash,'is_fetching'],true)
            .setIn(['recommend_list',action.payload.hash,'is_fetched'],false)

        case LOAD_RECOMMEND_CLUB_LIST_SUCCESS:
            return state.setIn(['recommend_list',action.payload.hash,'is_fetching'],false)
            .setIn(['recommend_list',action.payload.hash,'is_fetched'],true)
            .setIn(['recommend_list',action.payload.hash,'list'],Immutable.List(action.payload.response.result))
            .setIn(['recommend_list',action.payload.hash,'total'],action.payload.response.total)

        case LOAD_RECOMMEND_CLUB_LIST_FAILURE:
            return state.setIn(['recommend_list',action.payload.hash,'is_fetching'],false)
            .setIn(['recommend_list',action.payload.hash,'is_fetched'],false)



        default:
            return state
    }
}


