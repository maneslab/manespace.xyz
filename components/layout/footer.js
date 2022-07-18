export default function Footer(props) {
    return (
		<div className="lg:flex lg:justify-between max-w-screen-xl mx-auto w-full py-4">
			<div className="text-center text-sm lg:text-base lg:text-left">© 2022 ManeSTUDIO by WeirdoGhostGang</div>
			<div className="gap-4 flex justify-center text-sm lg:text-base lg:justify-end">
				<a href="/" className="hover:text-gray-400">ManeStudio</a>
				<a href="/" className="hover:text-gray-400">ManeSpace</a>
				<a href="/" className="hover:text-gray-400">Support</a>
			</div>
		</div>
    )
}
