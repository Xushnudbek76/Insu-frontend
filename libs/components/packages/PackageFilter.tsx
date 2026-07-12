import { ChangeEvent } from 'react';
import { Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'next-i18next/pages';
import type { PackageSelectOption } from '@/libs/components/packages/config';

export interface PackageFilterValues {
  selectedType: string;
  selectedStatus: string;
  searchText: string;
  priceMin: string;
  priceMax: string;
  coverageLimit: string;
}

interface PackageFilterProps {
  values: PackageFilterValues;
  typeOptions: PackageSelectOption[];
  statusOptions: PackageSelectOption[];
  coverageOptions: PackageSelectOption[];
  onChange: (values: PackageFilterValues) => void;
}

const PackageFilter = ({
  values,
  typeOptions,
  statusOptions,
  coverageOptions,
  onChange,
}: PackageFilterProps) => {
  const { t } = useTranslation('common');

  const updateValue = (key: keyof PackageFilterValues, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const handlePriceChange =
    (key: 'priceMin' | 'priceMax') => (event: ChangeEvent<HTMLInputElement>) => {
      updateValue(key, event.target.value);
    };

  return (
    <Box className={'filters-sidebar'}>
      <p className={'filters-title'}>{t('Filters')}</p>
      <p className={'filters-sub'}>{t('Narrow your search')}</p>

      <Box className={'filter-section'}>
        <p className={'filter-label'}>{t('SEARCH')}</p>
        <Box className={'price-row'}>
          <input
            type='text'
            placeholder={t('Package name')}
            value={values.searchText}
            onChange={(event) => updateValue('searchText', event.target.value)}
            className={'price-input'}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
            <SearchIcon />
          </Box>
        </Box>
      </Box>

      <Box className={'filter-section'}>
        <p className={'filter-label'}>{t('INSURANCE TYPE')}</p>
        {typeOptions.map((option) => (
          <label key={option.value} className={'checkbox-row'}>
            <input
              type='checkbox'
              checked={values.selectedType === option.value}
              onChange={() => updateValue('selectedType', option.value)}
              className={'pkg-checkbox'}
            />
            <span className={'checkbox-text'}>{t(option.label)}</span>
          </label>
        ))}
      </Box>

      <Box className={'filter-section'}>
        <p className={'filter-label'}>{t('STATUS')}</p>
        <select
          value={values.selectedStatus}
          onChange={(event) => updateValue('selectedStatus', event.target.value)}
          className={'coverage-select'}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </Box>

      <Box className={'filter-section'}>
        <p className={'filter-label'}>{t('PRICE RANGE')}</p>
        <Box className={'price-row'}>
          <input
            type='number'
            placeholder={t('Min')}
            value={values.priceMin}
            onChange={handlePriceChange('priceMin')}
            className={'price-input'}
          />
          <input
            type='number'
            placeholder={t('Max')}
            value={values.priceMax}
            onChange={handlePriceChange('priceMax')}
            className={'price-input'}
          />
        </Box>
      </Box>

      <Box className={'filter-section'}>
        <p className={'filter-label'}>{t('COVERAGE LIMIT')}</p>
        <select
          value={values.coverageLimit}
          onChange={(event) => updateValue('coverageLimit', event.target.value)}
          className={'coverage-select'}
        >
          {coverageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </Box>
    </Box>
  );
};

export default PackageFilter;
