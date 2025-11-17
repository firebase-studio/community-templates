# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-25.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.go_1_24
    pkgs.sqlite
    pkgs.nodejs_20
    pkgs.nodePackages.nodemon
  ];
  # Sets environment variables in the workspace
  env = { };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "golang.go"
    ];
    workspace = {
      onCreate = {
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "main.go" ];
        installDependencies = "go get && go mod tidy";
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = [
            "nodemon"
            "--signal"
            "SIGHUP"
            "-w"
            "."
            "-e"
            "go,html"
            "-x"
            "go run main.go serve --http='localhost:$PORT'"
          ];
          manager = "web";
        };
      };
    };
  };
}
