// app/components/Header.tsx
"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  Box,
  Tooltip,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Theme,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext";
import { motion } from "framer-motion";
import ListItemButton from "@mui/material/ListItemButton";
import SettingsIcon from "@mui/icons-material/Settings";
import Image from "next/image";

interface HeaderProps {
  mode: "light" | "dark";
  onThemeToggle: () => void;
}

export default function Header({ mode, onThemeToggle }: HeaderProps) {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(null);
  const [currentLanguage, setCurrentLanguage] = useState("en"); // Default language

  const handleLogout = async () => {
    try {
      // Call the logout API route
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
        notify("Logged out successfully.", "success");
        router.push("/auth/login");
      } else {
        const errorData = await response.json();
        notify(errorData.message || "Logout failed.", "error");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      notify("An unexpected error occurred during logout.", "error");
    }
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    handleLanguageMenuClose();
    // Future implementation for language change
  };

  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {user && (
          <>
            <ListItem>
              <ListItemIcon>
                <Avatar src={user.avatarUrl} alt={user.name} />
              </ListItemIcon>
              <ListItemText primary={user.name} secondary={user.email} />
            </ListItem>
            <Divider />
            <ListItemButton onClick={() => { /* Future Profile */ }}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
            <ListItemButton onClick={() => { /* Future Settings */ }}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
            <Divider />
            <ListItem>
              <ListItemIcon>
                {mode === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
              </ListItemIcon>
              <ListItemText primary="Theme" />
              <Switch
                checked={mode === "dark"}
                onChange={onThemeToggle}
                color="default"
                inputProps={{ "aria-label": "theme toggle" }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                {/* Language Picker */}
                <Image
                  src={
                    currentLanguage === "en"
                      ? "https://flagicons.lipis.dev/flags/4x3/us.svg"
                      : "https://flagicons.lipis.dev/flags/4x3/il.svg"
                  }
                  alt="Language"
                  width={24}
                  height={24}
                />
              </ListItemIcon>
              <ListItemText primary="Language" />
              <IconButton onClick={handleLanguageMenuOpen} color="inherit">
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={languageAnchorEl}
                open={Boolean(languageAnchorEl)}
                onClose={handleLanguageMenuClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={() => handleLanguageChange("en")}>
                  <Image
                    src="https://flagicons.lipis.dev/flags/4x3/us.svg"
                    alt="English"
                    width={24}
                    height={24}
                  />
                  <Typography variant="inherit" sx={{ ml: 1 }}>
                    English
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => handleLanguageChange("he")}>
                  <Image
                    src="https://flagicons.lipis.dev/flags/4x3/il.svg"
                    alt="Hebrew"
                    width={24}
                    height={24}
                  />
                  <Typography variant="inherit" sx={{ ml: 1 }}>
                    Hebrew
                  </Typography>
                </MenuItem>
              </Menu>
            </ListItem>
          </>
        )}
        {!user && (
          <>
            <ListItemButton onClick={() => router.push("/auth/login")}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton onClick={() => router.push("/auth/signup")}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItemButton>
            <Divider />
            <ListItem>
              <ListItemIcon>
                {mode === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
              </ListItemIcon>
              <ListItemText primary="Theme" />
              <Switch
                checked={mode === "dark"}
                onChange={onThemeToggle}
                color="default"
                inputProps={{ "aria-label": "theme toggle" }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background:
            mode === "light"
              ? "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)"
              : "#1e1e1e",
          justifyContent: "center",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left Side - Empty for Centering */}
          <Box sx={{ flex: 1 }} />

          {/* Center - App Name, Bat Icon, and Beta Text */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              flex: 1,
              justifyContent: "center",
            }}
            onClick={() => router.push("/dashboard")}
          >
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: mode === "light" ? "#000" : "#fff",
                }}
              >
                NightCrew
              </Typography>
              <Image
                src="/bat.svg"
                alt="Bat Icon"
                width={24}
                height={24}
                style={{
                  marginRight: 15,
                  filter:
                    mode === "light"
                      ? "invert(0%)"
                      : "invert(100%)", // Invert colors based on theme
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  marginRight: 20,
                  color: mode === "light" ? "#000" : "#fff",
                }}
              >
                beta
              </Typography>
            </motion.div>
          </Box>

          {/* Right Side - Controls */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              {/* Language Picker */}
              <Tooltip title="Select Language">
                <IconButton onClick={handleLanguageMenuOpen} color="inherit">
                  <Image
                    src={
                      currentLanguage === "en"
                        ? "https://flagicons.lipis.dev/flags/4x3/us.svg"
                        : "https://flagicons.lipis.dev/flags/4x3/il.svg"
                    }
                    alt="Language"
                    width={24}
                    height={24}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={languageAnchorEl}
                open={Boolean(languageAnchorEl)}
                onClose={handleLanguageMenuClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={() => handleLanguageChange("en")}>
                  <Image
                    src="https://flagicons.lipis.dev/flags/4x3/us.svg"
                    alt="English"
                    width={24}
                    height={24}
                  />
                  <Typography variant="inherit" sx={{ ml: 1 }}>
                    English
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => handleLanguageChange("he")}>
                  <Image
                    src="https://flagicons.lipis.dev/flags/4x3/il.svg"
                    alt="Hebrew"
                    width={24}
                    height={24}
                  />
                  <Typography variant="inherit" sx={{ ml: 1 }}>
                    Hebrew
                  </Typography>
                </MenuItem>
              </Menu>

              {/* Theme Toggle */}
              <Tooltip title="Toggle light/dark mode">
                <IconButton onClick={onThemeToggle} color="inherit">
                  {mode === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              {/* User Account Info */}
              {user && (
                <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                  <Tooltip title="User Account">
                    <IconButton onClick={handleMenuOpen} color="inherit">
                      <Avatar src={user.avatarUrl} alt={user.name} />
                      <Typography
                        variant="body1"
                        sx={{
                          ml: 1,
                          display: { xs: "none", sm: "block" },
                          color: mode === "light" ? "#000" : "#fff",
                        }}
                      >
                        {user.name}
                      </Typography>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem onClick={() => { /* Future Profile */ handleMenuClose(); }}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => { /* Future Settings */ handleMenuClose(); }}>
                      Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              )}
              {!user && (
                <>
                  <Button color="inherit" onClick={() => router.push("/auth/login")}>
                    Login
                  </Button>
                  <Button color="inherit" onClick={() => router.push("/auth/signup")}>
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile View - Hamburger Menu */}
          {isMobile && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            </motion.div>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile View */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerList}
      </Drawer>
    </>
  );
}
