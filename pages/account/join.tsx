import { useState } from "react";
import { NextPage } from "next";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import withLayoutBasic from "@/layout/LayoutBasic";
import { logIn, signUp } from "@/libs/auth";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import MobileJoinPage from "@/libs/components/mobile/account/MobileJoinPage";
import { sweetTopSuccessAlert } from "@/libs/sweetAlert";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

export const getStaticProps = async ({
  locale = "en",
}: {
  locale?: string;
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

const JoinPage: NextPage = () => {
  const device = useDeviceDetect();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginNick, setLoginNick] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupNick, setSignupNick] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupType, setSignupType] = useState<"USER" | "AGENT">("USER");

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setError("");
    setActiveTab(value);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await logIn({
        memberNick: loginNick,
        memberPassword: loginPassword,
      });
      await sweetTopSuccessAlert("Welcome back!");
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      await signUp({
        memberNick: signupNick,
        memberPassword: signupPassword,
        memberPhone: signupPhone,
        memberType: signupType,
      });
      await sweetTopSuccessAlert("Account created successfully!");
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (device === "mobile") {
    return (
      <MobileJoinPage
        activeTab={activeTab}
        loading={loading}
        error={error}
        loginNick={loginNick}
        loginPassword={loginPassword}
        signupNick={signupNick}
        signupPassword={signupPassword}
        signupPhone={signupPhone}
        signupType={signupType}
        onTabChange={handleTabChange}
        onLoginNickChange={setLoginNick}
        onLoginPasswordChange={setLoginPassword}
        onSignupNickChange={setSignupNick}
        onSignupPasswordChange={setSignupPassword}
        onSignupPhoneChange={setSignupPhone}
        onSignupTypeChange={setSignupType}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={3} sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: "center" }}>
          Login / Register
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {activeTab === 0 ? (
          <Stack spacing={2}>
            <TextField
              label="Nickname"
              value={loginNick}
              onChange={(event) => setLoginNick(event.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              size="large"
              disabled={loading || !loginNick || !loginPassword}
              onClick={handleLogin}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Nickname"
              value={signupNick}
              onChange={(event) => setSignupNick(event.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={signupPassword}
              onChange={(event) => setSignupPassword(event.target.value)}
              fullWidth
            />
            <TextField
              label="Phone"
              value={signupPhone}
              onChange={(event) => setSignupPhone(event.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Member Type"
              value={signupType}
              onChange={(event) =>
                setSignupType(event.target.value as "USER" | "AGENT")
              }
              fullWidth
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="AGENT">AGENT</MenuItem>
            </TextField>
            <Button
              variant="contained"
              size="large"
              disabled={
                loading || !signupNick || !signupPassword || !signupPhone
              }
              onClick={handleSignup}
            >
              {loading ? "Registering..." : "Create Account"}
            </Button>
          </Stack>
        )}

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Welcome
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default withLayoutBasic(JoinPage);
