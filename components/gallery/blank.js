import SpaceIcon from 'public/img/icons/space.svg'

export default function GalleryBlank({size}) {

    let icon_size = "w-24";
    if (size == 'middle') {
        icon_size = "w-16";
    }


    return (
        <div className='bg-gray-100 h-full w-full flex justify-center items-center dark:bg-[#25282e] '>
                <SpaceIcon className={"text-gray-300 dark:text-[#32353b] "+icon_size} />
        </div>
    );
}
