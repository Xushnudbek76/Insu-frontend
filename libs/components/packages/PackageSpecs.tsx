import { Box } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import { formatCoverage } from './helpers';

interface PackageSpecsProps {
  coverageLimit?: number | null;
  minAge?: number | null;
  maxAge?: number | null;
  assetTags?: string[] | null;
}

const PackageSpecs = ({
  coverageLimit,
  minAge,
  maxAge,
  assetTags,
}: PackageSpecsProps) => {
  const hasSpecs =
    coverageLimit != null ||
    minAge != null ||
    (assetTags && assetTags.length > 0);

  if (!hasSpecs) return null;

  return (
    <Box component={'section'} className={'pd-specs'}>
      {coverageLimit != null && (
        <Box className={'spec-card'}>
          <ShieldOutlinedIcon className={'spec-icon'} />
          <span className={'spec-label'}>COVERAGE LIMIT</span>
          <span className={'spec-value'}>{formatCoverage(coverageLimit)}</span>
        </Box>
      )}
      {minAge != null && (
        <Box className={'spec-card'}>
          <EventRepeatIcon className={'spec-icon'} />
          <span className={'spec-label'}>AGE REQUIREMENT</span>
          <span className={'spec-value'}>
            {minAge} – {maxAge ?? '∞'} yrs
          </span>
        </Box>
      )}
      {assetTags && assetTags.length > 0 && (
        <Box className={'spec-card'}>
          <LabelOutlinedIcon className={'spec-icon'} />
          <span className={'spec-label'}>ASSET TAGS</span>
          <Box className={'spec-tags'}>
            {assetTags.map((tag) => (
              <span key={tag} className={'spec-tag'}>
                {tag}
              </span>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PackageSpecs;
