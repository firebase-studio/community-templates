{ pkgs, language ? "js", ... }: {
  packages = [
    pkgs.nodejs_20
  ];
  bootstrap =
    ''
      mkdir "$out"
      mkdir -p "$out/.idx/"
      cp -rf ${./dev.nix} "$out/.idx/dev.nix"
      cp -r ${./README.md} "$out"
      if [ "${language}" == "ts" ]; then
        shopt -s dotglob
        cp -r ${./monorepo-ts}/* "$out"
      else
        shopt -s dotglob
        cp -r ${./monorepo}/* "$out"
      fi
      chmod -R +w "$out"
    '';
}
