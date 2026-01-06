{ inputs, pkgs, ... }:

let
  system = pkgs.stdenv.hostPlatform.system;
  ags = inputs.ags;

  astalPackages = with ags.packages.${system}; [
    io
    astal4
    notifd
    wireplumber
    hyprland
    apps
    mpris
    cava
  ];

  extraPackages =
    astalPackages
    ++ (with pkgs; [
      libadwaita
      libsoup_3
    ]);
in
{
  packages = [
    (ags.packages.${system}.default.override {
      inherit extraPackages;
    })
  ];
}
