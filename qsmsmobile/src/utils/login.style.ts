// login.style.ts
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { COLORS, SIZES } from "../constants/theme";

interface LoginStyles {
  cover: ImageStyle;
  titleLogin: TextStyle;
  wrapper: ViewStyle;
  label: TextStyle;
  inputWrapper: ViewStyle;    
  iconStyle: TextStyle;
  input: TextStyle;
  passwordContainer: ViewStyle;
  errorMessage: TextStyle;
  registration: TextStyle;
  container: ViewStyle;
  image: ImageStyle;
  loadingText: TextStyle;
}

const styles = StyleSheet.create<LoginStyles>({
  cover: {
    height: SIZES.height / 2.4,
    width: SIZES.width,
    marginBottom: SIZES.xxLarge,
  },

  titleLogin: {
    marginVertical: 20,
    marginHorizontal: 60,
    fontFamily: "bold",
    fontSize: 15,
    color: COLORS.primary,
    textAlign: "center",
  },

  wrapper: {
    marginBottom: 20,
  },

  label: {
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
    marginBottom: 5,
    marginEnd: 5,
    textAlign: "right",
  },

  // base input wrapper (use array style to override borderColor dynamically)
  inputWrapper: {
    borderColor: COLORS.lightWhite, // default
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
  },

  iconStyle: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "regular",
    paddingVertical: 0,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    // border is applied via inputWrapper; keep this minimal
  },

  errorMessage: {
    color: COLORS.red,
    fontFamily: "regular",
    marginTop: 5,
    marginLeft: 5,
    fontSize: SIZES.xSmall,
  },

  registration: {
    marginTop: 20,
    textAlign: "center",
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: 200,
    height: 200,
  },

  loadingText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
    fontFamily: "regular",
  },
});

export default styles;
