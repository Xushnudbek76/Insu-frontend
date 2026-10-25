import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client/react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'next-i18next/pages';
import { GET_FAQS } from '@/apollo/faq/query';
import type { Faq } from '@/libs/types/faq/faq';

interface GetFaqsResponse {
	getFaqs: { list: Faq[] };
}

const HomeFaq = () => {
	const { t } = useTranslation('common');

	const { data } = useQuery<GetFaqsResponse>(GET_FAQS, {
		variables: { input: { page: 1, limit: 6, sort: 'faqOrder', direction: 'ASC', search: {} } },
		fetchPolicy: 'cache-and-network',
	});

	const faqs = (data?.getFaqs?.list ?? []).filter((faq) => faq.faqQuestion && faq.faqAnswer);

	// Stays hidden until FAQs are added in the admin panel
	if (faqs.length === 0) return null;

	return (
		<Stack className={'home-faq'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'home-faq-head'}>
					<span className={'section-tag'}>{t('Support')}</span>
					<h2>{t('FAQ')}</h2>
					<NextLink href={'/cs'} className={'more-link'}>
						{t('See all FAQs')}
						<ArrowForwardRoundedIcon />
					</NextLink>
				</Box>
				<Box component={'div'} className={'home-faq-list'}>
					{faqs.map((faq) => (
						<details key={faq._id} className={'home-faq-item'}>
							<summary>
								<span>{faq.faqQuestion}</span>
								<AddRoundedIcon className={'home-faq-icon'} />
							</summary>
							<p>{faq.faqAnswer}</p>
						</details>
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

export default HomeFaq;
