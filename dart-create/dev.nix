# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-25.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodePackages.firebase-tools    
    pkgs.dart
  ];
  # Sets environment variables in the workspace
  env = {
    PATH = ["/home/user/.pub-cache/bin" "/home/user/flutter/bin" "./.flutter-sdk/flutter/bin"];
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "Dart-Code.dart-code"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        install-dependencies = "dart pub get";
        # install-cli = "dart pub global activate webdev";
      };
    };
    # previews = {
    #   enable = true;
    #   previews = {
    #     web = {
    #       command = ["webdev" "serve" "--auto=refresh" "--hostname" "0.0.0.0" "--no-launch-in-chrome" "web:$PORT"];
    #       manager = "web";
    #     };
    #   };
    # };
  };
}
