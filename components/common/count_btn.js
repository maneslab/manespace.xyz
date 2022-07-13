import {useState} from 'react';
export default function CountBtn({count,max_count,handleCountChange}) {

    let countChange = (ct) => {
        if (ct > max_count) {
            ct = max_count
        }else if (ct < 1) {
            ct = 1
        }
        handleCountChange(ct);
    }


    return (
        <div className='flex justify-center flex-start mr-4'>
            <a className='btn btn-default' onClick={countChange.bind({},count-1)}>-</a>
            <span className='btn bg-[#333]'>{count}</span>
            <a className='btn btn-default' onClick={countChange.bind({},count+1)}>+</a>
        </div>
    )
}
