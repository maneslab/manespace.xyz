import { normalize } from 'normalizr';
import Immutable from 'immutable';
import { removeValueEmpty} from 'helper/common'

import { nftListSchema ,nftSchema } from 'redux/schema/index'
import manenft  from 'helper/web3/manenft';
// import { object } from 'yup';
import {createAction} from 'helper/common'

// function formatNftOne(one) {
//     return {
//         'amount' : one.amount,
//         'content' : one.content,
//         'endTime' : one.endTime,
//         'depositTime' : one.depositTime,
//         'isWithdrawed' : one.isWithdrawed,
//         'tokenAddress' : one.tokenAddress,
//         'tokenId' : one.tokenId.toString()
//     }
// }

export const SET_NFT_BALANCE = 'SET_NFT_BALANCE'
export const setNftBalance = createAction(SET_NFT_BALANCE);


function formatNftList(arr) {
    let result = new Array();
    arr.map(one=>{
        result.push(one.toString())
    })
    return result
}

export const BEFORE_LOAD_NFT_LIST = 'BEFORE_LOAD_NFT_LIST'
export const LOAD_NFT_LIST_SUCCESS = 'LOAD_NFT_LIST_SUCCESS'
export const LOAD_NFT_LIST_FAILURE = 'LOAD_NFT_LIST_FAILURE'

export function loadNftList(condition) {


    condition.limit = condition.page_size;
    condition.offset = (condition.page - 1) * condition.page_size;

    condition = removeValueEmpty(condition);

    console.log('format-condition',condition)

    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_NFT_LIST', 'LOAD_NFT_LIST_SUCCESS', 'LOAD_NFT_LIST_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => !state.getIn(['nft','list',condition.address,'is_fetching']),
        // 进行取：
        callAPI: () => {

            console.log('debug05,发起nftlist请求:',condition.address,condition.limit,condition.offset,condition.contract_address);
            let manenft_instance = new manenft(condition.contract_address);
            return manenft_instance.contract.getTokenIDsByHolder(condition.address,condition.offset,condition.limit)
        },

        dataSource : 'contract',

        data_format : (result) => {
            console.log('debug05,result',result)
            let result_formated = formatNftList(result);
            console.log('debug05,result_formated',result_formated)
            return result_formated
        },

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    false
        },

        payload: {
            merge_type:'concat',
            ...condition
        }
    };
}


export function loadNftListAll(condition) {

    condition.limit = condition.page_size;
    condition.offset = (condition.page - 1) * condition.page_size;

    condition = removeValueEmpty(condition);
    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_NFT_LIST', 'LOAD_NFT_LIST_SUCCESS', 'LOAD_NFT_LIST_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => !state.getIn(['nft','list','all','is_fetching']),
        // 进行取：
        callAPI: () => {
            let fm = new Nft();

            return fm.contract.getTokenList(condition.offset,condition.limit);
        },

        dataSource : 'contract',

        data_format : (result) => {
            let result_formated = formatNftList(result);
            return normalize(result_formated, nftListSchema)
        },

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    false
        },

        payload: {
            'address' : 'all',
            ...condition
        }
    };
}


export const BEFORE_LOAD_NFT = 'BEFORE_LOAD_NFT'
export const LOAD_NFT_SUCCESS = 'LOAD_NFT_SUCCESS'
export const LOAD_NFT_FAILURE = 'LOAD_NFT_FAILURE'

export function loadNft(token_id) {

    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_NFT', 'LOAD_NFT_SUCCESS', 'LOAD_NFT_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => !state.getIn(['nft','load',token_id,'is_fetching']),
        // 进行取：
        callAPI: () => {
            let fm = new Nft();
            return fm.contract.readMsg(token_id);
        },

        dataSource : 'contract',

        data_format : (result) => {
            let result_formated = formatNftOne(result);
            return normalize(result_formated, nftSchema)
        },

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    false
        },

        payload: {
            token_id:token_id,
        }
    };
}



export function reducer(state = Immutable.fromJS({
    'list' : {},
    'load' : {},
    'load_owner' : {},
}), action) {
    switch (action.type) {

        case BEFORE_LOAD_NFT:
            return state
            .setIn(['load',action.payload.token_id,'is_fetching'],true)
            .setIn(['load',action.payload.token_id,'is_fetched'],false)

        case LOAD_NFT_SUCCESS:
        case LOAD_NFT_FAILURE:
            return state
            .setIn(['load',action.payload.token_id,'is_fetching'],false)
            .setIn(['load',action.payload.token_id,'is_fetched'],true)


        case BEFORE_LOAD_NFT_LIST:
            return state
            .updateIn(['list',action.payload.contract_address,action.payload.address],objectmap=>{
                if (!objectmap) {
                    objectmap = Immutable.fromJS({
                        'is_fetching'    :  false,
                        'is_fetched'     :  false,
                        'list'           :  Immutable.List([]),
                        'is_end'         :  false,
                        'total'          :  0
                    });  
                }
                objectmap = objectmap.merge({
                    'is_fetching'    : true,
                    'is_fetched'     : false,
                    'list'           : Immutable.List([]),
                    'is_end'         : false,
                })
                return objectmap
            });

        case LOAD_NFT_LIST_SUCCESS:
            console.log('debug05,load-list-action',action);
            let is_end = false;
            if (action.payload.response.length < action.payload.limit) {
                is_end = true;
            }
            return state
            .updateIn(['list',action.payload.contract_address,action.payload.address],objectmap=>{
                objectmap = objectmap.merge({
                    'is_fetching' : false,
                    'is_fetched'  : true,
                    'list'        : Immutable.List(action.payload.response),
                    'is_end'      : is_end
                })
                return objectmap
            });

        case LOAD_NFT_LIST_FAILURE:
            return state
            .updateIn(['list',action.payload.contract_address,action.payload.address],objectmap=>{
                objectmap = objectmap.merge({
                    'is_fetching' : false,
                    'is_fetched'  : true,
                })
                return objectmap
            })

        case SET_NFT_BALANCE:
            return state
                .setIn(['list',action.payload.contract_address,action.payload.address,'total'],action.payload.balance);

        default:
            return state
    }
}


