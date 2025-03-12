// src/LoginPage.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { Input } from "../components/UI/Input";
import Logo from "../assets/logo.png";
import SideImageLeft from "../assets/side-left.png";
import SideImageRight from "../assets/side-right.png";
import BottomLogo from "../assets/bottom-logo.svg";
import { Button } from "./UI/Buttons/DefaultButton";
import { jwtDecode } from "jwt-decode";
import { useLoginMutation } from "../redux/api/api";

interface JwtPayload {
  username: string;
  sub: string;
  role: string;
  allowedStatuses: string[];
}

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ username, password }).unwrap();
      const token = result.access_token;
      // Декодируем токен для получения данных пользователя
      const decoded = jwtDecode<JwtPayload>(token);
      dispatch(
        setCredentials({
          token,
          user: {
            userId: decoded.sub,
            username: decoded.username,
            role: decoded.role,
            allowedStatuses: decoded.allowedStatuses,
          },
        })
      );
    } catch (err) {
      // Обработка ошибки (отображается ниже)
      console.error("Ошибка при логине:", err);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center m-0-auto pt-12 px-4">
      <img
        src={SideImageLeft}
        alt="Декорация слева"
        className="absolute left-0 top-0 h-screen object-cover hidden md:block"
      />
      <img
        src={SideImageRight}
        alt="Декорация справа"
        className="absolute right-0 top-0 h-screen object-cover hidden md:block"
      />

      <div className="z-10 max-w-md w-full space-y-8 flex flex-col items-center">
        <img src={Logo} alt="Логотип" className="mb-4" />

        <form
          className="mt-8 space-y-6 w-full flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4 w-full flex flex-col items-center">
            <Input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* {error && (
            <div className="text-red-500 text-sm text-center">
              Неверное имя пользователя или пароль
            </div>
          )} */}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Войти"}
          </Button>
        </form>
      </div>

      <div className="absolute bottom-0 left-0 w-full flex justify-center pb-4">
        <img src={BottomLogo} alt="Powered by Oyan" className="h-8" />
      </div>
    </div>
  );
};

export default LoginPage;
