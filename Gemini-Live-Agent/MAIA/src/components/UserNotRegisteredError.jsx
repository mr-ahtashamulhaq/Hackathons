import { Button } from '@/components/ui/button'

export default function UserNotRegisteredError() {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-background p-6">
			<div className="max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
				<h1 className="font-heading text-2xl font-bold text-foreground">Profile unavailable</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					This local demo does not support remote account registration. Reload to continue with the built-in demo profile.
				</p>
				<Button className="mt-5" onClick={() => window.location.assign('/')}>
					Return Home
				</Button>
			</div>
		</div>
	)
}