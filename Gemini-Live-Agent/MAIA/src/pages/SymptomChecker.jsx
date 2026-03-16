import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, HeartPulse, Loader2 } from 'lucide-react'

import { appClient } from '@/lib/app-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import EmergencyBanner from '@/components/shared/EmergencyBanner'

const stages = [
	{ value: 'prenatal', label: 'Pregnancy' },
	{ value: 'labor', label: 'Labor' },
	{ value: 'postpartum', label: 'Postpartum' },
]

export default function SymptomChecker() {
	const navigate = useNavigate()
	const [stage, setStage] = useState('prenatal')
	const [symptoms, setSymptoms] = useState('')
	const [analysis, setAnalysis] = useState('')
	const [isChecking, setIsChecking] = useState(false)

	const runCheck = async () => {
		if (!symptoms.trim()) {
			return
		}

		setIsChecking(true)
		const response = await appClient.integrations.Core.InvokeLLM({
			prompt: `You are MAIA. A user is in the ${stage} stage and reports: ${symptoms}. Give a short triage response with monitor, call provider, urgent care, or emergency guidance when appropriate.`,
		})

		setAnalysis(response)
		setIsChecking(false)

		await appClient.entities.SymptomLog.create({
			symptoms: symptoms
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),
			severity: 'moderate',
			ai_assessment: response,
			stage,
		})
	}

	return (
		<div className="max-w-lg mx-auto pb-8">
			<div className="px-5 pt-6 pb-3 flex items-center gap-3">
				<Button size="icon" variant="ghost" onClick={() => navigate('/Dashboard')} className="rounded-xl">
					<ArrowLeft className="w-5 h-5" />
				</Button>
				<div>
					<h1 className="text-xl font-heading font-bold">Symptom Checker</h1>
					<p className="text-xs text-muted-foreground">Organize symptoms and next steps</p>
				</div>
			</div>

			<EmergencyBanner />

			<div className="px-5 space-y-4">
				<Card className="p-4 space-y-4">
					<div>
						<p className="text-sm font-medium mb-2">Current stage</p>
						<Select value={stage} onValueChange={setStage}>
							<SelectTrigger className="rounded-xl">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{stages.map((item) => (
									<SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<p className="text-sm font-medium mb-2">Symptoms</p>
						<Textarea
							value={symptoms}
							onChange={(event) => setSymptoms(event.target.value)}
							placeholder="Describe symptoms, when they started, and whether they are getting worse..."
							className="min-h-[120px] rounded-xl"
						/>
					</div>

					<Button className="w-full rounded-xl h-11" onClick={runCheck} disabled={isChecking || !symptoms.trim()}>
						{isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HeartPulse className="mr-2 h-4 w-4" />}
						{isChecking ? 'Reviewing...' : 'Check Symptoms'}
					</Button>
				</Card>

				{analysis && (
					<Card className="p-5 bg-muted/50">
						<div className="mb-3 flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-primary" />
							<h2 className="font-heading text-lg font-semibold">Guidance</h2>
						</div>
						<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{analysis}</p>
					</Card>
				)}
			</div>
		</div>
	)
}