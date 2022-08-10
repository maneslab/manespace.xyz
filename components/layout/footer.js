import DiscordIcon from 'public/img/icons/discord.svg'
import TwitterIcon from 'public/img/icons/twitter.svg'
export default function Footer(props) {
    return (
		<div className="lg:flex lg:justify-between max-w-screen-xl mx-auto w-full py-4">
			<div className="text-center text-sm lg:text-left">© 2022 ManeSPACE by WeirdoGhostGang, powered by ManesLAB</div>
			<div className="gap-4 flex justify-center text-sm items-center lg:justify-end">
				<a href="https://www.manestudio.xyz" target="_blank" className="hover:text-gray-400">ManeStudio</a>
				<a href="https://www.maneslab.xyz" target="_blank" 	className="hover:text-gray-400">ManesLAB</a>
				<a href="https://twitter.com/manestudioxyz" target="_blank" className="hover:text-gray-400"><TwitterIcon className="icon-xs"/></a>
				<a href="https://discord.gg/EnCUugtfVn" target="_blank" className="hover:text-gray-400"><DiscordIcon className="icon-xs"/></a>
			</div>
		</div>
    )
}
