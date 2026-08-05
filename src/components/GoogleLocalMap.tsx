/**
 * Carte des résultats locaux.
 *
 * Recréée en SVG d'après une capture Google Maps de Paris : mêmes teintes
 * (fond gris très clair, axes bleu-gris, rues secondaires gris pâle, parcs
 * vert pastel, fleuve bleu clair), même densité de réseau, mêmes écussons
 * routiers et mêmes repères rouges.
 *
 * Le réseau de rues n'est pas une grille écrite à la main : il est produit par
 * une subdivision récursive du plan avec un générateur pseudo-aléatoire à
 * graine fixe. Les quartiers ont donc des formes irrégulières, les
 * intersections sont crédibles, et la hiérarchie des voies découle de la
 * profondeur de subdivision (les premières coupes deviennent les boulevards).
 * Le tirage étant déterministe, la carte est identique à chaque frame et à
 * chaque rendu.
 *
 * Le plan source mesure 820 × 300, mais le viewBox est resserré autour du
 * quartier central pour retrouver le niveau de zoom d'une vraie recherche
 * locale Google. Le ratio du cadre (984 × 360) reste strictement conservé.
 *
 * La carte étant redessinée, elle ne porte aucune mention d'attribution.
 */

import React from "react";
import { LAYOUT } from "../config/google-ui";
import { FONT_FAMILY } from "../config/fonts";
import { ExpandIcon } from "./GoogleIcons";

/** 820 × 300 = 984 / 360 : aucun rognage. */
const VB_W = 820;
const VB_H = 300;

/** Zoom de quartier relevé sur la capture Google de référence. */
const MAP_ZOOM = 1.55;
const VIEW_W = VB_W / MAP_ZOOM;
const VIEW_H = VB_H / MAP_ZOOM;
const VIEW_X = (VB_W - VIEW_W) / 2;
const VIEW_Y = (VB_H - VIEW_H) / 2;

/**
 * Teintes relevées sur la capture Google Maps de référence.
 * Elles vivent ici plutôt que dans google-ui.ts : la hiérarchie des voies
 * (majeure / intermédiaire / secondaire) n'a de sens que pour cette carte.
 */
const M = {
  /** Fond de la ville. */
  land: "#F4F3F1",
  /** Périphérie, à peine plus grise. */
  landAlt: "#EDECE9",
  /** Grands axes bleu-gris et leur liseré. */
  roadMajor: "#C3D2DE",
  roadMajorCasing: "#B2C3D2",
  /** Voies intermédiaires. */
  roadMid: "#D8D8D5",
  /** Petites rues, gris très clair. */
  roadMinor: "#DEDDD9",
  /** Espaces verts pastel. */
  park: "#D3E7CE",
  /** La Seine. */
  water: "#ABCDE7",
  /** Écussons de numéros de route. */
  shield: "#7FA05C",
  /** Rouge des repères. */
  pin: "#EA4335",
} as const;

/* -------------------------------------------------------------------------- */
/*  Réseau de rues                                                            */
/* -------------------------------------------------------------------------- */

/** PRNG déterministe (mulberry32) : même carte à chaque rendu. */
const makeRng = (seed: number) => {
  let a = seed;

  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type Street = { d: string; level: number };

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Découpe récursivement un rectangle et retient chaque coupe comme une rue.
 * Les coupes sont légèrement courbées et décalées : aucun angle parfaitement
 * droit, donc un tissu urbain qui ne lit pas comme un quadrillage.
 */
const buildStreets = (): Street[] => {
  const rand = makeRng(20260802);
  const out: Street[] = [];

  const split = (x: number, y: number, w: number, h: number, level: number) => {
    if (level > 10 || w < 7 || h < 6) {
      return;
    }

    // Les blocs larges se coupent verticalement, les blocs hauts
    // horizontalement — avec une part d'exception, comme une vraie ville.
    const vertical = w > h * 1.6 ? rand() > 0.12 : rand() > 0.62;
    const t = 0.34 + rand() * 0.32;
    const skip = level >= 7 && rand() > 0.74;

    if (vertical) {
      const cx = x + w * t;
      const j = (rand() - 0.5) * Math.min(4, h * 0.09);
      if (!skip) {
        out.push({
          d: `M${r1(cx)} ${r1(y)} C ${r1(cx + j)} ${r1(y + h * 0.34)}, ${r1(
            cx - j,
          )} ${r1(y + h * 0.68)}, ${r1(cx + j * 0.4)} ${r1(y + h)}`,
          level,
        });
      }
      split(x, y, w * t, h, level + 1);
      split(cx, y, w * (1 - t), h, level + 1);
    } else {
      const cy = y + h * t;
      const j = (rand() - 0.5) * Math.min(3.5, w * 0.05);
      if (!skip) {
        out.push({
          d: `M${r1(x)} ${r1(cy)} C ${r1(x + w * 0.34)} ${r1(cy + j)}, ${r1(
            x + w * 0.68,
          )} ${r1(cy - j)}, ${r1(x + w)} ${r1(cy + j * 0.4)}`,
          level,
        });
      }
      split(x, y, w, h * t, level + 1);
      split(x, cy, w, h * (1 - t), level + 1);
    }
  };

  // Débordement volontaire : les rues filent jusqu'aux bords du cadre.
  split(-24, -24, VB_W + 48, VB_H + 48, 0);

  return out;
};

const STREETS = buildStreets();
const STREETS_MINOR = STREETS.filter((s) => s.level >= 4);
const STREETS_MID = STREETS.filter((s) => s.level === 2 || s.level === 3);
const STREETS_MAJOR = STREETS.filter((s) => s.level <= 1);

/** Boulevards traversants, ajoutés par-dessus la trame. */
const BOULEVARDS = [
  "M-20 86 C 180 82, 300 94, 424 90 C 566 85, 690 94, 840 88",
  "M-20 214 C 160 219, 306 206, 452 210 C 606 214, 706 205, 840 210",
  "M-20 148 C 140 145, 258 158, 402 154 C 552 150, 690 162, 840 156",
  "M210 -20 C 206 70, 214 142, 204 220 C 198 268, 202 300, 200 320",
  "M488 -20 C 494 70, 484 142, 500 220 C 512 268, 506 300, 508 320",
  "M666 -20 C 662 66, 674 136, 662 214 C 654 264, 658 300, 656 320",
  "M52 320 C 172 234, 300 172, 434 110 C 530 66, 632 48, 716 -20",
  "M796 320 C 712 246, 640 212, 556 176 C 470 138, 400 112, 340 -20",
  "M-20 44 C 200 40, 420 52, 620 44 C 720 40, 780 44, 840 42",
  "M-20 262 C 200 258, 420 268, 620 260 C 720 256, 780 260, 840 258",
];

/* -------------------------------------------------------------------------- */
/*  Éléments ponctuels                                                        */
/* -------------------------------------------------------------------------- */

/** Écusson de numéro de route (N185, E15…). */
const RoadShield: React.FC<{ x: number; y: number; label: string }> = ({
  x,
  y,
  label,
}) => {
  const width = 8 + label.length * 5.2;

  return (
    <g>
      <rect x={x} y={y} width={width} height={12} rx={2.5} fill={M.shield} />
      <text
        x={x + width / 2}
        y={y + 8.9}
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily={FONT_FAMILY}
        fontSize={8}
        fontWeight={500}
      >
        {label}
      </text>
    </g>
  );
};

/** Repère rouge Google : anneau rouge, centre blanc, ombre discrète. */
const Marker: React.FC<{ x: number; y: number; big?: boolean }> = ({
  x,
  y,
  big = false,
}) => {
  const r = big ? 8.4 : 6;

  return (
    <g>
      <ellipse
        cx={x}
        cy={y + r * 0.55}
        rx={r * 0.9}
        ry={r * 0.4}
        fill="#000000"
        opacity={0.16}
      />
      <circle cx={x} cy={y} r={r} fill="#FFFFFF" />
      <circle
        cx={x}
        cy={y}
        r={r - 1.5}
        fill="none"
        stroke={M.pin}
        strokeWidth={big ? 3.6 : 2.8}
      />
    </g>
  );
};

/** Point rouge secondaire (lieu non classé). */
const Dot: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <circle cx={x} cy={y} r={2.4} fill={M.pin} />
);

/** Repère accompagné du nom de l'établissement. */
const NamedMarker: React.FC<{
  x: number;
  y: number;
  label: string;
  anchor?: "start" | "end";
}> = ({ x, y, label, anchor = "start" }) => (
  <g>
    <Marker x={x} y={y} big />
    <text
      x={anchor === "start" ? x + 14 : x - 14}
      y={y + 4}
      textAnchor={anchor}
      fill="#3C4043"
      fontFamily={FONT_FAMILY}
      fontSize={11.5}
      fontWeight={500}
      stroke="#FFFFFF"
      strokeWidth={2.8}
      paintOrder="stroke"
    >
      {label}
    </text>
  </g>
);

const DOTS: readonly (readonly [number, number])[] = [
  [148, 96],
  [206, 140],
  [268, 78],
  [292, 186],
  [356, 224],
  [392, 66],
  [412, 172],
  [446, 232],
  [470, 108],
  [512, 158],
  [548, 210],
  [586, 92],
  [604, 168],
  [648, 122],
  [678, 218],
  [716, 150],
];

export const GoogleLocalMap: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: LAYOUT.mapHeight,
        borderRadius: LAYOUT.mapRadius,
        overflow: "hidden",
        backgroundColor: M.land,
      }}
    >
      <svg
        viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block" }}
      >
        <rect x={0} y={0} width={VB_W} height={VB_H} fill={M.land} />

        {/* Périphérie à peine plus grise, sans bord franc */}
        <rect x={0} y={0} width={VB_W} height={148} fill={M.landAlt} opacity={0.45} />
        <rect x={0} y={236} width={VB_W} height={64} fill={M.landAlt} opacity={0.5} />

        {/* Trame de rues, de la plus fine à la plus large */}
        <g fill="none" strokeLinecap="round">
          <g stroke={M.roadMinor} strokeWidth={0.9}>
            {STREETS_MINOR.map((s, i) => (
              <path key={i} d={s.d} />
            ))}
          </g>
          <g stroke={M.roadMid} strokeWidth={1.5}>
            {STREETS_MID.map((s, i) => (
              <path key={i} d={s.d} />
            ))}
          </g>
          <g stroke={M.roadMajorCasing} strokeWidth={3.6}>
            {STREETS_MAJOR.map((s, i) => (
              <path key={i} d={s.d} />
            ))}
          </g>
          <g stroke={M.roadMajor} strokeWidth={2.6}>
            {STREETS_MAJOR.map((s, i) => (
              <path key={i} d={s.d} />
            ))}
          </g>

          {/* Boulevards traversants */}
          <g stroke={M.roadMajorCasing} strokeWidth={3.8}>
            {BOULEVARDS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g stroke={M.roadMajor} strokeWidth={2.7}>
            {BOULEVARDS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </g>

        {/* Espaces verts, posés par-dessus la trame */}
        <g fill={M.park}>
          <path d="M-20 58 C 34 40, 96 56, 104 104 C 112 152, 62 196, 6 190 C -34 186, -40 130, -20 58 Z" />
          <path d="M712 158 C 768 140, 838 156, 848 210 C 858 264, 800 292, 742 282 C 694 274, 672 190, 712 158 Z" />
          <ellipse cx={296} cy={64} rx={31} ry={20} />
          <ellipse cx={534} cy={116} rx={26} ry={17} />
          <ellipse cx={188} cy={222} rx={24} ry={16} />
          <ellipse cx={612} cy={252} rx={28} ry={18} />
          <ellipse cx={430} cy={40} rx={22} ry={13} />
          <ellipse cx={356} cy={264} rx={20} ry={12} />
        </g>

        {/* La Seine et un affluent */}
        <path
          d="M-20 120 C 100 106, 186 154, 296 160 C 400 166, 466 128, 566 144 C 668 160, 736 196, 840 188"
          stroke={M.water}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M296 160 C 318 202, 302 252, 328 320"
          stroke={M.water}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />

        <RoadShield x={86} y={26} label="A13" />
        <RoadShield x={702} y={52} label="A3" />
        <RoadShield x={132} y={262} label="N118" />
        <RoadShield x={682} y={268} label="E15" />
        <RoadShield x={380} y={16} label="N185" />
        <RoadShield x={356} y={276} label="N4A" />

        {/* Toponymes, halo blanc comme les libellés Google Maps */}
        <g
          fontFamily={FONT_FAMILY}
          stroke="#FFFFFF"
          strokeWidth={2.6}
          paintOrder="stroke"
        >
          <text
            x={22}
            y={28}
            fill="#5F6368"
            fontSize={13}
            fontWeight={500}
            letterSpacing={1.4}
          >
            PARIS
          </text>

          <g fill="#6E7275" fontSize={8.6} fontWeight={500} letterSpacing={0.8}>
            <text x={214} y={46}>
              CHAMPS-ÉLYSÉES
            </text>
            <text x={252} y={238}>
              MONTPARNASSE
            </text>
          </g>

          <g fill="#80868B" fontSize={10}>
            <text x={140} y={130}>
              16E
            </text>
            <text x={566} y={58}>
              11E
            </text>
            <text x={562} y={228}>
              12E
            </text>
          </g>

          <g fill="#70757A" fontSize={10.5}>
            <text x={690} y={32}>
              Bagnolet
            </text>
            <text x={742} y={78}>
              Montreuil
            </text>
            <text x={730} y={148}>
              Vincennes
            </text>
          </g>

          <g fill="#5B8A55" fontSize={8.8}>
            <text x={8} y={158}>
              Bois de Boulogne
            </text>
            <text x={734} y={230}>
              Bois de Vincennes
            </text>
          </g>
        </g>

        {/* Points secondaires */}
        {DOTS.map(([x, y], i) => (
          <Dot key={i} x={x} y={y} />
        ))}

        {/* Repères des résultats locaux */}
        <Marker x={322} y={126} />
        <Marker x={258} y={162} />
        <Marker x={398} y={204} />
        <Marker x={478} y={134} />
        <Marker x={352} y={70} big />
        <NamedMarker x={438} y={82} label="Maison Barber" />
        <NamedMarker x={560} y={186} label="Barber District" />
      </svg>

      {/* Bouton "agrandir la carte" */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 62,
          height: 62,
          borderRadius: "50%",
          backgroundColor: "#202124",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ExpandIcon size={28} />
      </div>
    </div>
  );
};
