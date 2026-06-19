import LanguageIcon from '@mui/icons-material/Language';
import { IconButton, Tooltip, Typography, type SxProps, type Theme } from '@mui/material';
import { useI18n } from '../i18n';

interface LocaleToggleButtonProps {
  sx?: SxProps<Theme>;
  size?: 'small' | 'medium' | 'large';
}

export function LocaleToggleButton({ sx, size = 'small' }: LocaleToggleButtonProps) {
  const { locale, setLocale, t } = useI18n();
  return (
    <Tooltip title={t('app.language')}>
      <IconButton onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')} size={size} sx={sx}>
        <LanguageIcon fontSize="small" />
        <Typography component="span" sx={{ ml: 0.5, fontSize: '0.7rem', fontWeight: 800 }}>
          {locale.toUpperCase()}
        </Typography>
      </IconButton>
    </Tooltip>
  );
}
