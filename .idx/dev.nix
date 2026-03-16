{ pkgs, ... }: {
  channel = "stable-25.05";

  packages = [
    pkgs.nodejs_20
    pkgs.jdk17
  ];

  env = {
    EXPO_USE_FAST_RESOLVER = 1;
    JAVA_HOME = "${pkgs.jdk17}";
    ANDROID_HOME = "/home/user/.androidsdkroot";
  };

  idx = {
    extensions = [
      "msjsdiag.vscode-react-native"
    ];
    workspace = {
      onCreate = {
        install =
          "npm ci --prefer-offline --no-audit --no-progress --timing && npm i @expo/ngrok@^4.1.0";
      };
      onStart = {
        android = ''
          echo -e "\033[1;33mWaiting for Android emulator to be ready...\033[0m"
          adb -s emulator-5554 wait-for-device && \
          npm run android -- --tunnel
        '';
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "web" "--" "--port" "$PORT" ];
          manager = "web";
        };
        android = {
          command = [ "tail" "-f" "/dev/null" ];
          manager = "web";
        };
      };
    };
  };
}