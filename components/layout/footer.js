export default function Footer(props) {
    return (
		<div className="lg:flex lg:justify-between max-w-screen-xl mx-auto w-full py-4">
			<div className="text-center text-sm lg:text-base lg:text-left">© 2022 ManeSPACE by WeirdoGhostGang</div>
			<div className="gap-4 flex justify-center text-sm lg:text-base lg:justify-end">
				<a href="https://www.manestudio.xyz" target="_blank" className="hover:text-gray-400">ManeStudio</a>
				<a href="https://www.maneslab.xyz" target="_blank" 	className="hover:text-gray-400">ManesLAB</a>
				<a href="https://twitter.com/maneslab" target="_blank" className="hover:text-gray-400">Twitter</a>
				<a href="https://discord.gg/EnCUugtfVn" className="hover:text-gray-400">Discord</a>
			</div>
		</div>
    )
}
