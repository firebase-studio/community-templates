{ pkgs, version ? "17", ... }: {
  packages = [
    pkgs.git
  ];

  bootstrap = let
    odoo = rec {
      packagesV15 = [
        "pkgs.gcc"
        "pkgs.python39"
        "pkgs.openldap"
        "pkgs.openldap.dev"
        "pkgs.cyrus_sasl.dev"
        "pkgs.libpqxx"
        "pkgs.libxml2.dev"
        "pkgs.libxslt.dev"
      ];

      packagesV16 = [
        "pkgs.gcc"
        "pkgs.python311"
        "pkgs.openldap"
        "pkgs.openldap.dev"
        "pkgs.cyrus_sasl.dev"
        "pkgs.libpqxx"
      ];

      packagesV17 = packagesV16;
    };
  in
    ''
      mkdir "$out"
      cd "$out"

      mkdir -p .idx/.data/
      mkdir -p .vscode/

      cp -f ${./dev.nix} ".idx/dev.nix"
      cp -f ${./httpserver.sh} "httpserver.sh"
      cp -f ${./README.md} "README.md"
      cp -f ${./settings.json} ".vscode/settings.json"
      printf "/.idx/odoo\n/.idx/odoo-data" > ".gitignore"

      git clone https://github.com/odoo/odoo.git --single-branch --branch ${version}.0 --depth 1 .idx/.data/odoo

      sed -i                                                                                  \
          -e "s/\$WS_NAME/$WS_NAME/g"                                                         \
          -e 's/$PACKAGES/${builtins.concatStringsSep "\\\n    " odoo.${"packagesV" + version}}/g' \
          .idx/dev.nix

      
      mkdir custom_addons

      cd ..
      chmod -R +w "$out"
    '';
}