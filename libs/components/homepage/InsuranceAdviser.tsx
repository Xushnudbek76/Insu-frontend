import React, { FormEvent, useState } from 'react';
import { Stack, Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useLazyQuery } from '@apollo/client/react';
import { useTranslation } from 'next-i18next/pages';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { GET_INSURANCE_RECOMMENDATION } from '@/apollo/user/query';

type InsuranceTypeValue = 'AUTO' | 'HOME' | 'HEALTH' | 'TRAVEL';

interface InsuranceRecommendationPackage {
	_id: string;
	packageType: string;
	packageTitle: string;
	packagePrice: number;
	packageDesc?: string | null;
}

interface InsuranceRecommendationData {
	getInsuranceRecommendation: {
		riskScore: number;
		reason: string;
		rawFactors?: string[] | null;
		recommendedPackages: InsuranceRecommendationPackage[];
	};
}

interface InsuranceRecommendationVariables {
	input: {
		types: InsuranceTypeValue[];
		age?: number;
		budget?: number;
		text?: string;
	};
}

type QueryErrorLike = {
	message?: string;
	errors?: Array<{ message?: string }>;
	graphQLErrors?: Array<{ message?: string }>;
};

const INSURANCE_TYPE_OPTIONS: { value: InsuranceTypeValue; label: string }[] = [
	{ value: 'AUTO', label: 'Car' },
	{ value: 'HOME', label: 'Home' },
	{ value: 'HEALTH', label: 'Health' },
	{ value: 'TRAVEL', label: 'Travel' },
];

const InsuranceAdviser: React.FC = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [selectedType, setSelectedType] = useState<InsuranceTypeValue>('AUTO');
	const [age, setAge] = useState('');
	const [budget, setBudget] = useState('');
	const [text, setText] = useState('');
	const [formError, setFormError] = useState<string | null>(null);
	const [apiError, setApiError] = useState<string | null>(null);

	const [getRecommendation, { data, loading, error }] = useLazyQuery<
		InsuranceRecommendationData,
		InsuranceRecommendationVariables
	>(GET_INSURANCE_RECOMMENDATION, {
		fetchPolicy: 'network-only',
	});

	const result = data?.getInsuranceRecommendation ?? null;

	const getErrorMessage = () => {
		if (!error) return apiError;
		const queryError = error as QueryErrorLike;
		const graphQLErrorMessage =
			queryError.errors?.[0]?.message ??
			queryError.graphQLErrors?.[0]?.message ??
			queryError.message ??
			'';
		if (graphQLErrorMessage === 'No data found!') {
			return t('No matching insurance plans found for your criteria. Try increasing your budget or changing insurance type.');
		}
		return t('Something went wrong. Please try again.');
	};

	const handleSelectType = (value: InsuranceTypeValue) => {
		setSelectedType(value);
	};

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();

		const trimmedAge = age.trim();
		const ageValue = Number(trimmedAge);
		if (!trimmedAge || Number.isNaN(ageValue) || ageValue <= 0) {
			setFormError(t('Please enter a valid age.'));
			return;
		}

		const trimmedBudget = budget.trim();
		const budgetValue = Number(trimmedBudget);
		if (!trimmedBudget || Number.isNaN(budgetValue) || budgetValue <= 0) {
			setFormError(t('Please enter your monthly budget.'));
			return;
		}

		setFormError(null);
		setApiError(null);

		const input: InsuranceRecommendationVariables['input'] = {
			types: [selectedType],
			age: ageValue,
			budget: budgetValue,
		};

		const textValue = text.trim();
		if (textValue) {
			input.text = textValue;
		}

		getRecommendation({ variables: { input } });
	};

	return (
		<Stack className={'trend-packages ai-recommendation'} id='insurance-adviser'>
			<Stack className={'container'}>
				<Stack className={'ai-header'}>
					<Box component={'div'} className={'ai-header-text'}>
						<span className={'section-label'}>{t('AI Recommendation')}</span>
						<strong className={'section-title'}>{t('AI Insurance Advisor')}</strong>
						<p className={'section-desc'}>
							{t("Tell us what you want to protect and we'll suggest the best insurance plans for you.")}
						</p>
					</Box>
				</Stack>
				<Stack className={'ai-content'}>
					<Box component={'form'} className={'ai-form'} onSubmit={handleSubmit}>
						<Box component={'div'} className={'field-group'}>
							<label className={'field-label'}>{t('What do you want to insure?')}</label>
							<Box component={'div'} className={'type-chip-group'}>
								{INSURANCE_TYPE_OPTIONS.map((option) => (
									<button
										key={option.value}
										type="button"
										className={
											'type-chip' +
											(selectedType === option.value ? ' active' : '')
										}
										onClick={() => handleSelectType(option.value)}
									>
										{t(option.label)}
									</button>
								))}
							</Box>
						</Box>
						<Box component={'div'} className={'field-row'}>
							<Box component={'div'} className={'field'}>
								<label className={'field-label'} htmlFor="ai-age">
									{t('Age')}
								</label>
								<input
									id="ai-age"
									type="number"
									className={'text-input'}
									value={age}
									onChange={(event) => setAge(event.target.value)}
									placeholder={device === 'mobile' ? t('Your age') : ''}
								/>
							</Box>
							<Box component={'div'} className={'field'}>
								<label className={'field-label'} htmlFor="ai-budget">
									{t('Monthly budget ($)')}
								</label>
								<input
									id="ai-budget"
									type="number"
									className={'text-input'}
									value={budget}
									onChange={(event) => setBudget(event.target.value)}
									placeholder={device === 'mobile' ? t('Budget per month') : ''}
								/>
							</Box>
						</Box>
						<Box component={'div'} className={'field'}>
							<label className={'field-label'} htmlFor="ai-text">
								{t('Tell us more (optional)')}
							</label>
							<textarea
								id="ai-text"
								className={'text-area'}
								rows={3}
								value={text}
								onChange={(event) => setText(event.target.value)}
								placeholder={t('Example: I drive a new car and want full coverage, plus basic health protection.')}
							/>
						</Box>
						{formError && <p className={'form-error'}>{formError}</p>}
						{(error || apiError) && !formError && (
							<p className={'form-error'}>{getErrorMessage()}</p>
						)}
						<button type="submit" className={'primary-btn'} disabled={loading}>
							{loading ? t('Asking AI...') : t('Get recommendation')}
						</button>
					</Box>
					<Box component={'div'} className={'ai-result'}>
						{!result && !loading && !error && !apiError && (
							<Box component={'div'} className={'ai-result-empty'}>
								<strong>{t('AI suggestions will appear here.')}</strong>
								<p>
									{t('Choose what you want to insure and press Get recommendation.')}
								</p>
							</Box>
						)}

						{loading && (
							<Box component={'div'} className={'ai-result-loading'}>
								<span>{t('Analyzing your options...')}</span>
							</Box>
						)}

						{result && !loading && (
							<Box component={'div'} className={'ai-result-content'}>
								<Box component={'div'} className={'ai-summary'}>
									<span className={'risk-badge'}>
										{t('Risk score')}: {result.riskScore}
									</span>
									<p className={'ai-reason'}>{result.reason}</p>
								</Box>
								<Box component={'div'} className={'ai-packages'}>
									{result.recommendedPackages.map((pkg) => (
										<Box
											key={pkg._id}
											component={'div'}
											className={'package-card'}
											onClick={() => router.push(`/packages/${pkg._id}`)}
										>
											<span className={'package-type'}>
												{t(formatInsuranceType(pkg.packageType))}
											</span>
											<strong className={'package-name'}>
												{pkg.packageTitle}
											</strong>
											{pkg.packageDesc && (
												<p className={'package-desc'}>{pkg.packageDesc}</p>
											)}
											<span className={'package-price'}>
												${pkg.packagePrice.toLocaleString()}
											</span>
										</Box>
									))}
								</Box>
								{result.rawFactors && result.rawFactors.length > 0 && (
									<Box component={'div'} className={'ai-factors'}>
										<span className={'factors-label'}>{t('Why these packages?')}</span>
										<ul className={'factors-list'}>
											{result.rawFactors.map((factor, index) => (
												<li key={index}>{factor}</li>
											))}
										</ul>
									</Box>
								)}
							</Box>
						)}
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

function formatInsuranceType(type: string): string {
	switch (type) {
		case 'AUTO':
			return 'Car insurance';
		case 'HOME':
			return 'Home insurance';
		case 'HEALTH':
			return 'Health insurance';
		case 'TRAVEL':
			return 'Travel insurance';
		default:
			return 'Insurance';
	}
}

export default InsuranceAdviser;
