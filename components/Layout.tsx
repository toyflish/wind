export default function Layout({children}: {children: React.ReactNode}) {
	return (
		<div className="layout">
		<h1>with layout</h1>
		{children}
		</div>
	);
}