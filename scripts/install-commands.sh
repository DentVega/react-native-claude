#!/usr/bin/env bash
#
# Instala los slash commands de expo-config-template a ~/.claude/commands/
#
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/REEMPLAZAR_USUARIO/expo-config-template/main/scripts/install-commands.sh | bash
#
# O desde un clone local:
#   bash scripts/install-commands.sh

set -euo pipefail

REPO_URL="${EXPO_TEMPLATE_REPO:-https://github.com/REEMPLAZAR_USUARIO/expo-config-template}"
REPO_RAW="${REPO_URL/github.com/raw.githubusercontent.com}/main"
CLAUDE_COMMANDS_DIR="$HOME/.claude/commands"

echo "📥 Instalando slash commands de expo-config-template..."
echo "    Destino: $CLAUDE_COMMANDS_DIR"
echo ""

# Verificar que tenemos curl
if ! command -v curl >/dev/null 2>&1; then
  echo "❌ Error: curl no está instalado." >&2
  exit 1
fi

# Crear el directorio si no existe
mkdir -p "$CLAUDE_COMMANDS_DIR"

# Función helper para descargar con backup
download_command() {
  local name="$1"
  local target="$CLAUDE_COMMANDS_DIR/$name"
  local source_url="$REPO_RAW/commands/$name"

  if [ -f "$target" ]; then
    local backup="${target}.bak.$(date +%s)"
    cp "$target" "$backup"
    echo "  ⚠️  $name ya existía — backup en $(basename "$backup")"
  fi

  if curl -fsSL "$source_url" -o "$target"; then
    echo "  ✅ $name"
  else
    echo "  ❌ Fallo al descargar $name desde $source_url" >&2
    return 1
  fi
}

download_command "apply-template.md"
download_command "update-template.md"

echo ""
echo "✅ Comandos instalados."
echo ""
echo "Verificando configuración del repo en los comandos..."

if grep -q "REEMPLAZAR_USUARIO" "$CLAUDE_COMMANDS_DIR/apply-template.md" 2>/dev/null; then
  echo ""
  echo "⚠️  Los comandos tienen la URL del repo como placeholder."
  echo "    Si forkeaste el repo, edita los archivos en $CLAUDE_COMMANDS_DIR y reemplaza"
  echo "    'REEMPLAZAR_USUARIO' por tu usuario de GitHub."
  echo ""
  echo "    Si vas a usar el repo upstream, eso ya está bien."
fi

echo ""
echo "🎉 Listo. En cualquier proyecto Expo:"
echo "   claude"
echo "   > /apply-template"
echo ""
