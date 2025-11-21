
import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');

const COLORS = {
  primary: "#4c64dbff",
  primary1: "#005CFF",
  secondary: "#003BB6",
  secondary1: "#ffe5db",
  tertiary: "#0078a6",

  gray: "#83829A",
  gray2: "#C1C0C8",

  offwhite: "#F3F4F8",
  white: "#FFFFFF",
  black: "#000000",
  red: "#e81e4d",
  green: " #00C135",
  lightWhite: "#FAFAFC",


  primary2: "#3498db",
  success: "#27ae60",
  successLight: "#d4efdf",
  warning: "#f39c12",
  warningLight: "#fdebd0",
  suspended: "#9b59b6", 
  suspendedLight: "#e8daef", 
  error: "#e74c3c",
  errorLight: "#f5b7b1",
  grayLight: "#ecf0f1",
 
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

