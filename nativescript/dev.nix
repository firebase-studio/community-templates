
{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.jdk17
    pkgs.androidenv.androidSdk
    pkgs.androidenv.platform-tools
    pkgs.androidenv.build-tools
    pkgs.androidenv.ndk
    pkgs.nodejs_20.pkgs.pnpm
  ];
  env = {
    ANDROID_HOME = "${pkgs.androidenv.androidSdk}";
    JAVA_HOME = "${pkgs.jdk17}";
  };
  idx = {
    extensions = [
      "nrwl.angular-console"
      "esbenp.prettier-vscode"
      "firsttris.vscode-jest-runner"
    ];
    workspace = {
      onCreate = {
        install = ''
          npm install -g nativescript
          ns create myapp --svelte
          cd myapp
          pnpm install
        '';
        default.openFiles = [ "app/app.js" ];
      };
      onStart = {
        preview = "ns preview";
      };
    };
  };
}
