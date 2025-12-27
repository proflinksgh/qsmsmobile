
import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');

const COLORS = {
  // Primary Brand Colors
  primary: "#4c64dbff",
  primary1: "#005CFF",
  secondary: "#003BB6",
  secondary1: "#ffe5db",
  tertiary: "#0078a6",

  // Neutral Colors
  gray: "#83829A",
  gray2: "#C1C0C8",
  gray3: "#6B7280",
  gray4: "#9CA3AF",
  gray5: "#374151",
  gray6: "#1F2937",
  gray7: "#4B5563",
  gray8: "#D1D5DB",  // Light gray for placeholders/empty states

  // Background Colors
  offwhite: "#F3F4F8",
  white: "#FFFFFF",
  black: "#000000",
  lightWhite: "#FAFAFC",
  background: "#F5F5F7",
  cardBg: "#FAFAFA",
  iconBg: "#F5F5F5",
  border: "#F3F4F6",
  divider: "#E5E7EB",

  // Status Colors
  red: "#e81e4d",
  green: "#00C135",
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  error: "#EF4444",
  errorLight: "#FEF2F2",
  info: "#6366F1",
  infoLight: "#EEF2FF",

  // Accent Colors (for icons, buttons, highlights)
  accent: "#3B82F6",       // Blue accent (Tailwind blue-500)
  accentLight: "#DBEAFE",  // Light blue background
  violet: "#8B5CF6",       // Violet/Purple accent (Tailwind violet-500)
  violetLight: "#EDE9FE",  // Light violet background

  // Legacy Status Colors
  primary2: "#3498db",
  suspended: "#9b59b6", 
  suspendedLight: "#e8daef", 
  grayLight: "#ecf0f1",

  // Gradient Colors (for dark theme headers/cards)
  gradientDark1: "#374151",
  gradientDark2: "#1F2937",
  
  // Gradient Colors (for purple theme headers)
  gradientPurple1: "#667EEA",
  gradientPurple2: "#764BA2",

  // Text Colors
  textPrimary: "#1F2937",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  
  // Input/Form Colors
  placeholder: "#9CA3AF",
  inputBorder: "#E5E7EB",
  inputBg: "#FFFFFF",
};


const SIZES = {
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 44,
  backBtn: 60,
  height,
  width
};


const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};


export { COLORS, SHADOWS, SIZES };

