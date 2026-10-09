import { Img, staticFile } from 'remotion';
import {
  Chips, Colour, Logo, Pack, Photo, Price, PriceRows, Reveal, Rule, SaveTag, Scene, Slot, Tag, useSpan,
} from './primitives';
import { C, F, H, MOTION, PANEL, W, abs, clamp, tx } from './theme';

// 1. Opening title
export function Opening() {
  const { T, s, e } = useSpan('Opening');
  const cam = 1 + 0.045 * clamp(T / (e - s), 0, 1);
  const plane = (at: number, x: number, w: number, color: string, d = 1.1) => {
    const p = MOTION.enter(T, at, d);
    return (
      <div
        style={abs({
          inset: 0,
          background: color,
          transform: `translateX(${(1 - p) * -1700}px)`,
          clipPath: `polygon(${x}px 0, ${x + w}px 0, ${x + w - 760}px ${H}px, ${x - 760}px ${H}px)`,
        })}
      />
    );
  };
  const badge = MOTION.pop(T, 1.8, 0.6);
  const logo = MOTION.enter(T, 0.35, 0.8);
  return (
    <Scene name="Opening">
      <div style={abs({ inset: 0, opacity: 0.55 * MOTION.draw(T, 0.1, 1.6) })}>
        <Photo id="bg-opening" ph="B&W expo hall or warehouse photo" s={s} e={e} from={1.12} to={1.04} x0={-30} x1={30} />
      </div>
      <div style={abs({ inset: 0, transform: `scale(${cam})`, transformOrigin: '30% 50%' })}>
        {plane(0.05, -1000, 2240, PANEL)}
        {plane(0.25, 1600, 70, C.blue)}
        {plane(0.4, 1700, 6, '#fff')}
        <div style={abs({ left: 140, top: 250, display: 'flex', flexDirection: 'column', gap: 18 })}>
          <Reveal at={0.55}><div style={tx(80, 300, '#fff', F.cn, { letterSpacing: '.05em' })}>HBT Conference 2026</div></Reveal>
          <Reveal at={0.75}><div style={tx(270, 900, '#fff', F.cn, { letterSpacing: '-0.01em' })}>Exclusive</div></Reveal>
          <Reveal at={0.95}><div style={tx(270, 900, C.blue, F.cn, { letterSpacing: '-0.01em' })}>Offers</div></Reveal>
          <Rule at={1.35} w={260} h={10} color={C.blue} style={{ marginTop: 18 }} />
          <Reveal at={1.55}><div style={tx(30, 500, '#fff', F.ex, { letterSpacing: '.18em', marginTop: 10 })}>Conference specials · 5 – 23 October 2026</div></Reveal>
        </div>
        <div style={abs({ right: 150, bottom: 150, opacity: badge, transform: `translateY(${(1 - badge) * 30}px)` })}>
          <Img src={staticFile('assets/60-years-white.png')} alt="" style={{ width: 230, display: 'block' }} />
        </div>
        <div style={abs({ left: 140, top: 96, opacity: logo, transform: `translateX(${(1 - logo) * -60}px)` })}>
          <Logo width={250} />
        </div>
      </div>
    </Scene>
  );
}

// 2. Paint Markers
export function PaintMarkers() {
  const { s, e } = useSpan('PaintMarkers');
  const p10: Colour[] = [['#231F20'], ['#D7282F'], ['#FFE600'], ['#FFFFFF']];
  const p20: Colour[] = [['#231F20'], ['#D7282F'], ['#1F4FA8'], ['#00A651'], ['#FFE600'], ['#EC1F8E'], ['#FFFFFF']];
  const card = (at: number, name: string, cols: string, value: number, was: number, chips: Colour[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, borderTop: `4px solid ${C.blue}`, paddingTop: 22, width: 400 }}>
      <Reveal at={at}><div style={tx(40, 800, '#fff')}>{name} <span style={{ fontWeight: 300, color: C.soft }}>· {cols}</span></div></Reveal>
      <Price at={at + 0.15} value={value} was={was} unit={'EX GST\nPER PACK'} size={150} />
      <Chips at={at + 0.6} colours={chips} size={34} gap={10} />
    </div>
  );
  return (
    <Scene name="PaintMarkers">
      <div style={abs({ left: 700, top: 0, right: 0, bottom: 0 })}>
        <Photo id="bg-paint-markers" ph="B&W photo: marking steel / fabrication" s={s} e={e} x0={40} x1={-40} />
      </div>
      <div style={abs({ inset: 0, background: PANEL, clipPath: 'polygon(0 0, 1180px 0, 820px 1080px, 0 1080px)' })} />
      <div style={abs({ inset: 0, background: C.blue, clipPath: 'polygon(1180px 0, 1196px 0, 836px 1080px, 820px 1080px)' })} />
      <div style={abs({ left: 120, top: 190, display: 'flex', flexDirection: 'column', gap: 16 })}>
        <Tag at={s + 0.25}>Paint Markers</Tag>
        <Reveal at={s + 0.4}><div style={tx(210, 900)}>P10 &amp; P20</div></Reveal>
        <Reveal at={s + 0.55}><div style={tx(48, 300, C.soft, F.cn, { letterSpacing: '.04em' })}>Permanent paint markers for metal, timber &amp; concrete</div></Reveal>
        <div style={{ display: 'flex', gap: 60, marginTop: 34 }}>
          {card(s + 0.9, 'P10', '4 colours', 34.56, 40.01, p10)}
          {card(s + 1.2, 'P20', '7 colours', 43.61, 50.5, p20)}
        </div>
        <div style={{ display: 'flex', gap: 22, alignItems: 'center', marginTop: 26 }}>
          <SaveTag at={s + 1.9} text="Save 13%" size={36} />
          <Reveal at={s + 2.1} dir="left">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={tx(28, 700, '#fff', F.ex, { letterSpacing: '.08em' })}>+ Ink Markers</span>
              <span style={tx(28, 500, C.soft, F.ex, { letterSpacing: '.06em' })}>i70 Black &amp; Blue $14.97 · i90 $14.97 · iFine $13.09</span>
            </div>
          </Reveal>
        </div>
      </div>
      <Pack id="pk-p10" ph="P10 Paint Marker pack (cut-out PNG)" x={1150} y={150} w={330} h={800} rot={-10} at={s + 0.35} float={0} />
      <Pack id="pk-p20" ph="P20 Paint Marker pack (cut-out PNG)" x={1470} y={190} w={340} h={800} rot={7} at={s + 0.55} float={1.2} />
    </Scene>
  );
}

// 3. Markal Paintstik
export function Paintstik() {
  const { T, s, e } = useSpan('Paintstik');
  const cols: Colour[] = [['#231F20'], ['#D7282F'], ['#1F4FA8'], ['#FFE600'], ['#F15A22'], ['#FFFFFF']];
  const stick = MOTION.enter(T, s + 0.6, 1.4);
  return (
    <Scene name="Paintstik">
      <Photo id="bg-paintstik" ph="B&W workshop: marking steel" s={s} e={e} from={1.16} to={1.05} x0={-60} x1={60} />
      <div style={abs({ inset: 0, background: 'linear-gradient(90deg, rgba(6,20,31,.96) 0%, rgba(0,58,93,.85) 42%, rgba(0,58,93,.15) 75%, rgba(6,20,31,.35) 100%)' })} />
      <div style={abs({ left: 120, top: 130, display: 'flex', flexDirection: 'column', gap: 14 })}>
        <Tag at={s + 0.25}>Markal Paintstik B</Tag>
        <Reveal at={s + 0.4}><div style={tx(170, 900)}>Built for</div></Reveal>
        <Reveal at={s + 0.55}><div style={tx(170, 900, C.blue)}>Steel</div></Reveal>
        <Rule at={s + 0.9} w={560} h={20} color={C.yellow} style={{ marginTop: 6 }} />
        <Reveal at={s + 1.0}><div style={tx(44, 300, C.soft, F.cn, { letterSpacing: '.04em', marginTop: 12 })}>Solid paint markers for rough, smooth &amp; oily surfaces</div></Reveal>
        <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end', marginTop: 30 }}>
          <Price at={s + 1.2} value={26.8} was={31.05} unit={'EX GST\n12 PACK'} size={150} />
          <SaveTag at={s + 1.9} text="Save 14%" size={38} style={{ alignSelf: 'flex-end', marginBottom: 56 }} />
        </div>
        <div style={{ marginTop: 14 }}><Chips at={s + 1.7} colours={cols} size={42} /></div>
      </div>
      <div style={abs({ left: 1040, top: 560, width: 860, height: 230, transform: `translateX(${(1 - stick) * 700}px) rotate(-16deg)`, opacity: clamp(stick * 1.5, 0, 1), filter: 'drop-shadow(0 30px 30px rgba(0,0,0,.6))' })}>
        <Slot id="pk-paintstik" fit="contain" placeholder="Markal Paintstik B (cut-out PNG, horizontal)" />
      </div>
    </Scene>
  );
}

// 4. Spray Writer — hero colour wall, fluoros glow
const SW_COLS: Colour[] = [
  ['#231F20', 'Black'], ['#FFFFFF', 'White'], ['#D7282F', 'Red'], ['#1F4FA8', 'Blue'], ['#00A651', 'Green'], ['#FFE600', 'Yellow'], ['#F15A22', 'Orange'], ['#6A2C91', 'Violet'],
  ['#00B4F0', 'Fluoro Blue', 1], ['#4CF02E', 'Fluoro Green', 1], ['#EEFF1A', 'Fluoro Yellow', 1], ['#FF6A13', 'Fluoro Orange', 1], ['#FF2DA0', 'Fluoro Pink', 1],
];
const DARK_TEXT = new Set(['#FFFFFF', '#FFE600', '#EEFF1A', '#4CF02E']);

export function SprayWriter() {
  const { T, s } = useSpan('SprayWriter');
  const cam = 1.28 - 0.28 * MOTION.draw(T, s - 0.2, 2.4);
  const glow = MOTION.draw(T, s + 1.5, 0.9);
  const panel = MOTION.enter(T, s + 1.1, 1.0);
  const spot = MOTION.draw(T, s + 1.8, 1.0);
  const sw = W / SW_COLS.length;
  return (
    <Scene name="SprayWriter">
      <div style={abs({ inset: 0, transform: `scale(${cam})`, transformOrigin: '72% 50%' })}>
        {SW_COLS.map(([hex, name, fl], i) => {
          const p = MOTION.enter(T, s - 0.1 + i * 0.05, 0.9);
          const pulse = fl ? 0.85 + 0.15 * Math.sin(T * 4 + i) : 1;
          const dim = fl ? 1 : 1 - glow * 0.35;
          return (
            <div
              key={i}
              style={abs({
                left: i * sw, top: 0, width: sw + 1, height: H,
                background: hex,
                transform: `translateY(${(1 - p) * -100}%)`,
                filter: `brightness(${dim})`,
                boxShadow: fl ? `0 0 ${90 * glow * pulse}px ${24 * glow * pulse}px ${hex}` : 'none',
                zIndex: fl ? 2 : 1,
              })}
            >
              <div style={abs({ left: '50%', bottom: 150, transform: 'translateX(-50%) rotate(-90deg)', transformOrigin: 'center', ...tx(30, 800, DARK_TEXT.has(hex) ? C.black : '#fff', F.cn, { letterSpacing: '.08em' }) })}>{name}</div>
            </div>
          );
        })}
      </div>
      <div style={abs({ inset: 0, background: 'linear-gradient(90deg, rgba(6,20,31,.55), rgba(6,20,31,0) 50%)', opacity: panel })} />
      <div style={abs({ left: 0, top: 0, width: 1060, height: H, background: PANEL, clipPath: 'polygon(0 0, 1060px 0, 760px 1080px, 0 1080px)', transform: `translateX(${(1 - panel) * -1100}px)` })}>
        <div style={abs({ left: 120, top: 200, width: 900, height: 700, background: `radial-gradient(closest-side, rgba(0,147,208,${0.55 * spot}), rgba(0,147,208,0))`, transform: 'translate(-120px, 120px)' })} />
        <div style={abs({ left: 120, top: 190, display: 'flex', flexDirection: 'column', gap: 16 })}>
          <Tag at={s + 1.25}>Spray Writer</Tag>
          <Reveal at={s + 1.35}><div style={tx(170, 900)}>13 Colours</div></Reveal>
          <Reveal at={s + 1.5}><div style={tx(64, 300, C.soft, F.cn, { letterSpacing: '.04em' })}>Including 5 fluoro</div></Reveal>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Price at={s + 1.8} value={5.29} was={6.13} unit={'EX GST · EACH\nCARTON OF 12'} size={230} />
            <SaveTag at={s + 2.5} text="Save 14%" size={40} />
          </div>
        </div>
      </div>
      <Pack id="pk-spraywriter" ph="Spray Writer fluoro can (cut-out PNG)" x={1330} y={130} w={380} h={840} rot={0} at={s + 2.0} from={-400} />
    </Scene>
  );
}

// 5. Spray Ink
export function SprayInk() {
  const { T, s, e } = useSpan('SprayInk');
  const cols: Colour[] = [['#231F20', 'Black'], ['#D7282F', 'Red'], ['#1F4FA8', 'Blue'], ['#00A651', 'Green'], ['#FFE600', 'Yellow'], ['#F15A22', 'Orange'], ['#FFFFFF', 'White'], ['#C9A57A', 'Covers Over Tan']];
  const band = MOTION.enter(T, s + 1.3, 1.0);
  return (
    <Scene name="SprayInk">
      <Photo id="bg-spray-ink" ph="B&W construction / civil site photo" s={s} e={e} from={1.04} to={1.13} x0={40} x1={-40} />
      <div style={abs({ inset: 0, background: 'linear-gradient(100deg, rgba(6,20,31,.94) 0%, rgba(6,20,31,.7) 38%, rgba(6,20,31,.1) 70%)' })} />
      <div style={abs({ left: 120, top: 170, display: 'flex', flexDirection: 'column', gap: 16 })}>
        <Tag at={s + 0.25}>Spray Ink</Tag>
        <Reveal at={s + 0.4}><div style={tx(150, 900)}>Mark the site.</div></Reveal>
        <Reveal at={s + 0.55}><div style={tx(150, 900, C.blue)}>Fast.</div></Reveal>
        <Reveal at={s + 0.8}><div style={tx(42, 300, C.soft, F.cn, { letterSpacing: '.04em', marginTop: 8 })}>High-visibility marking for construction, civil &amp; timber</div></Reveal>
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end', marginTop: 20 }}>
          <Price at={s + 1.0} value={5.03} was={5.82} unit={'EX GST · EACH\nCARTON OF 12'} size={170} />
          <SaveTag at={s + 1.7} text="Save 14%" size={38} style={{ alignSelf: 'flex-end', marginBottom: 56 }} />
        </div>
      </div>
      <div style={abs({ left: 0, top: 0, width: W, height: H, transform: `translateX(${(1 - band) * -2000}px)` })}>
        <div style={abs({ inset: 0, background: 'rgba(0,58,93,.92)', clipPath: 'polygon(0 860px, 1920px 700px, 1920px 1010px, 0 1080px)' })} />
        <div style={abs({ inset: 0, background: C.blue, clipPath: 'polygon(0 846px, 1920px 686px, 1920px 700px, 0 860px)' })} />
        <div style={abs({ left: 120, top: 890, transform: 'rotate(-4.76deg)', transformOrigin: 'left top' })}>
          <Chips at={s + 1.6} colours={cols} size={40} gap={44} labels />
        </div>
      </div>
      <Pack id="pk-sprayink-1" ph="Spray Ink can" x={1180} y={160} w={260} h={600} rot={-6} at={s + 0.4} float={0.3} />
      <Pack id="pk-sprayink-2" ph="Spray Ink can" x={1400} y={110} w={280} h={640} rot={0} at={s + 0.55} float={1.1} />
      <Pack id="pk-sprayink-3" ph="Spray Ink can" x={1630} y={170} w={260} h={590} rot={6} at={s + 0.7} float={2.0} />
    </Scene>
  );
}

// 6. Protech — products rotating on a 3D carousel
const PROTECH = ['Brake & Parts Cleaner', 'Multi-Purpose Lubricant', 'Penetrating Oil', 'Silicone Lubricant', 'Contact Cleaner', 'White Lithium Grease'];
export function Protech() {
  const { T, s, e } = useSpan('Protech');
  const spin = MOTION.enter(T, s - 0.2, 1.8);
  const base = ((-200 * (1 - spin) - (T - s) * 26) * Math.PI) / 180;
  const rows: [string, string][] = [['Brake & Parts Cleaner', '$5.38'], ['Multi-Purpose Lubricant', '$5.45'], ['Penetrating Oil', '$10.54'], ['Freeze Spray', '$11.94']];
  return (
    <Scene name="Protech">
      <Photo id="bg-protech" ph="B&W maintenance workshop photo" s={s} e={e} from={1.06} to={1.12} />
      <div style={abs({ inset: 0, background: 'radial-gradient(ellipse 60% 55% at 50% 62%, rgba(0,96,138,.55), rgba(6,20,31,.94) 75%)' })} />
      <div style={abs({ left: 0, right: 0, top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 })}>
        <Tag at={s + 0.25}>Protech Cleaners &amp; Lubricants</Tag>
        <Reveal at={s + 0.4}><div style={tx(110, 900)}>Maintain optimum performance</div></Reveal>
      </div>
      <div style={abs({ left: 560, top: 900, width: 800, height: 90, background: 'radial-gradient(closest-side, rgba(0,147,208,.55), rgba(0,147,208,0))' })} />
      {PROTECH.map((name, i) => {
        const a = base + i * ((Math.PI * 2) / PROTECH.length);
        const k = (Math.cos(a) + 1) / 2;
        const x = 960 + Math.sin(a) * 430;
        const sc = 0.5 + 0.5 * k;
        const turn = 0.6 + 0.4 * Math.abs(Math.cos(a * 2));
        return (
          <div
            key={i}
            style={abs({
              left: x - 130, top: 330, width: 260, height: 600,
              zIndex: Math.round(k * 100),
              transform: `scale(${sc * turn}, ${sc})`,
              transformOrigin: '50% 100%',
              filter: `brightness(${0.35 + 0.65 * k}) drop-shadow(0 30px 30px rgba(0,0,0,.6))`,
              opacity: clamp(spin * 2, 0, 1),
            })}
          >
            <Slot id={`pk-protech-${i + 1}`} fit="contain" placeholder={`Protech ${name}`} />
          </div>
        );
      })}
      <div style={abs({ left: 110, top: 470, zIndex: 120, display: 'flex', flexDirection: 'column', gap: 18 })}>
        <Reveal at={s + 0.9}><div style={tx(36, 300, C.soft, F.cn, { letterSpacing: '.06em' })}>15 lines from</div></Reveal>
        <Price at={s + 1.0} value={5.38} unit={'EX GST\nEACH'} size={160} />
        <SaveTag at={s + 1.7} text="Save up to 13%" size={34} />
      </div>
      <div style={abs({ right: 110, top: 480, zIndex: 120, width: 480, display: 'flex', flexDirection: 'column' })}>
        <PriceRows rows={rows} at={s + 1.2} step={0.14} pad={18} nameSize={30} valueSize={40} valueColor={C.blue} />
      </div>
    </Scene>
  );
}

// 7. Zinc Guard
export function ZincGuard() {
  const { T, s, e } = useSpan('ZincGuard');
  const sheen = clamp((T - (s + 1.0)) / 0.9, 0, 1);
  const logoP = MOTION.enter(T, s + 0.35, 0.9);
  const rows: [string, string][] = [['Cold Galvanising Aerosol', '$9.27'], ['Silver Zinc Aerosol', '$8.91'], ['Rust Converter Aerosol', '$9.75'], ['Cold Galvanising Brush On', 'from $30.29']];
  const zg = staticFile('assets/zinc-guard.png');
  return (
    <Scene name="ZincGuard">
      <Photo id="bg-zinc-guard" ph="B&W heavy industry: steel structure / bridge" s={s} e={e} from={1.14} to={1.04} x0={-50} x1={50} />
      <div style={abs({ inset: 0, background: 'linear-gradient(90deg, rgba(6,20,31,.2), rgba(6,20,31,.55))' })} />
      <div style={abs({ inset: 0, background: 'linear-gradient(270deg,#06141F 0%,#003A5D 70%,#00608A 100%)', clipPath: 'polygon(1080px 0, 1920px 0, 1920px 1080px, 720px 1080px)' })} />
      <div style={abs({ inset: 0, background: C.blue, clipPath: 'polygon(1064px 0, 1080px 0, 720px 1080px, 704px 1080px)' })} />
      <Pack id="pk-zinc-aerosol" ph="Zinc Guard Cold Galv aerosol" x={140} y={170} w={300} h={720} rot={-5} at={s + 0.35} />
      <Pack id="pk-zinc-tin" ph="Zinc Guard Silver Zinc tin" x={400} y={420} w={420} h={480} rot={3} at={s + 0.55} float={1.4} />
      <div style={abs({ left: 1060, top: 150, display: 'flex', flexDirection: 'column', gap: 18, width: 760 })}>
        <div style={{ position: 'relative', width: 560, height: 292, opacity: logoP, transform: `translateX(${(1 - logoP) * -80}px)` }}>
          <Img src={zg} alt="Zinc Guard" style={{ width: 560, display: 'block' }} />
          <div
            style={abs({
              inset: 0,
              WebkitMaskImage: `url(${zg})`,
              maskImage: `url(${zg})`,
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              background: `linear-gradient(110deg, rgba(255,255,255,0) ${sheen * 140 - 30}%, rgba(255,255,255,.85) ${sheen * 140 - 15}%, rgba(255,255,255,0) ${sheen * 140}%)`,
            })}
          />
        </div>
        <Reveal at={s + 0.75}><div style={tx(60, 300, '#fff', F.cn, { letterSpacing: '.04em', marginTop: 10 })}>Guard against corrosion</div></Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20, borderTop: `4px solid ${C.blue}` }}>
          <PriceRows rows={rows} at={s + 1.1} step={0.15} pad={20} nameSize={34} valueSize={48} />
        </div>
        <div style={{ display: 'flex', gap: 22, alignItems: 'center', marginTop: 22 }}>
          <SaveTag at={s + 1.9} text="Save up to 14%" size={36} />
          <Reveal at={s + 2.0} dir="left"><div style={tx(26, 500, C.soft, F.ex, { letterSpacing: '.12em' })}>All prices ex GST</div></Reveal>
        </div>
      </div>
    </Scene>
  );
}

// 8. Day 2 Only Specials — red urgency banner and countdown
export function Day2() {
  const { T, s } = useSpan('Day2');
  const band = MOTION.enter(T, s + 0.15, 0.9);
  const pulse = 1 + 0.06 * Math.max(0, Math.sin((T - s) * 5));
  // Ticks down fast for urgency rather than in real time.
  const left = Math.max(0, 86399 - Math.floor(Math.max(0, T - (s + 0.8)) / 0.09));
  const hh = String(Math.floor(left / 3600)).padStart(2, '0');
  const mm = String(Math.floor(left / 60) % 60).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const bar = 1 - MOTION.draw(T, s + 0.8, 3.2) * 0.35;
  const tick = 'HBT DAY 2 ONLY SPECIALS  ·  THURSDAY 15 OCTOBER 2026  ·  ONE DAY ONLY  ·  ';
  const tickX = (((T - s) * 140) % 1800) - 1800;
  const digit = (v: string, label: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <div style={{ background: '#0B1E2C', borderTop: `5px solid ${C.red}`, padding: '24px 22px 14px', ...tx(150, 900, '#fff', F.cn, { fontVariantNumeric: 'tabular-nums', letterSpacing: '.01em' }) }}>{v}</div>
      <span style={tx(24, 700, C.soft, F.ex, { letterSpacing: '.2em' })}>{label}</span>
    </div>
  );
  const colon = <span style={tx(130, 900, C.red, F.cn, { marginTop: 30 })}>:</span>;
  return (
    <Scene name="Day2" bg={C.deep}>
      <div style={abs({ inset: 0, background: 'radial-gradient(ellipse 70% 60% at 30% 40%, #10283A, #06141F 70%)' })} />
      <div style={abs({ left: 0, top: 0, width: W, height: H, transform: `translateX(${(1 - band) * -2100}px)` })}>
        <div style={abs({ inset: 0, background: C.red, filter: `brightness(${pulse})`, clipPath: 'polygon(0 170px, 1920px 60px, 1920px 470px, 0 580px)' })} />
        <div style={abs({ inset: 0, background: C.black, clipPath: 'polygon(0 580px, 1920px 470px, 1920px 530px, 0 640px)', overflow: 'hidden' })}>
          <div style={abs({ left: 0, top: 534, transform: `rotate(-3.28deg) translateX(${tickX}px)`, transformOrigin: 'left top', display: 'flex' })}>
            {[0, 1, 2, 3].map((k) => <span key={k} style={tx(30, 700, '#fff', F.ex, { letterSpacing: '.16em', whiteSpace: 'pre' })}>{tick}</span>)}
          </div>
        </div>
        <div style={abs({ left: 120, top: 175, transform: 'rotate(-3.28deg)', transformOrigin: 'left top' })}>
          <Reveal at={s + 0.45}><div style={tx(36, 700, '#fff', F.ex, { letterSpacing: '.24em' })}>HBT Conference 2026 · 15 October only</div></Reveal>
          <Reveal at={s + 0.55}><div style={tx(190, 400, '#fff', F.imp, { lineHeight: 1.0, marginTop: 6 })}>Day 2 Only Specials</div></Reveal>
        </div>
      </div>
      <div style={abs({ left: 120, top: 680, display: 'flex', flexDirection: 'column', gap: 18 })}>
        <Reveal at={s + 0.8}><div style={tx(30, 700, '#fff', F.ex, { letterSpacing: '.22em' })}>Offer ends in</div></Reveal>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: MOTION.enter(T, s + 0.85, 0.6) }}>
          {digit(hh, 'HRS')}{colon}{digit(mm, 'MIN')}{colon}{digit(ss, 'SEC')}
        </div>
      </div>
      <div style={abs({ left: 120, top: 1000, width: 680, height: 8, background: 'rgba(255,255,255,.18)' })}>
        <div style={{ width: `${bar * MOTION.draw(T, s + 0.8, 0.5) * 100}%`, height: '100%', background: C.red }} />
      </div>
      <div style={abs({ left: 930, top: 620, display: 'flex', flexDirection: 'column', gap: 12 })}>
        <Reveal at={s + 1.1}><div style={tx(54, 900)}>Line Marking Paint</div></Reveal>
        <div style={{ display: 'flex', gap: 34, alignItems: 'flex-end' }}>
          <Price at={s + 1.3} value={7.75} was={9.15} unit={'EX GST · EACH\nCARTON OF 12'} size={130} />
          <SaveTag at={s + 2.0} text="Save 15%" size={40} style={{ alignSelf: 'flex-end', marginBottom: 48 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: 560, borderTop: `4px solid ${C.red}` }}>
          <PriceRows rows={[['Professional Line Marking', '$14.35'], ['Hand Actuator Line Marking', '$7.75']]} at={s + 1.9} step={0.15} pad={14} nameSize={30} valueSize={40} />
        </div>
      </div>
      <Pack id="pk-line-marking" ph="Line Marking aerosol (cut-out PNG)" x={1580} y={430} w={290} h={600} rot={6} at={s + 1.0} from={-300} />
    </Scene>
  );
}

// 9. Floor Coating Systems — decorative flakes fall in
export function Floor() {
  const { T, s, e } = useSpan('Floor');
  const swatch: Colour[] = [['#7E8386', 'Manhattan'], ['#2B2D2F', 'Carbon'], ['#A9AEB1', 'Sterling Grey']];
  const mask = 'linear-gradient(90deg, transparent 0%, transparent 38%, #000 62%)';
  return (
    <Scene name="Floor">
      <Photo id="bg-floor" ph="B&W modern garage / commercial floor" s={s} e={e} from={1.18} to={1.06} x0={50} x1={-50} />
      <div style={abs({ inset: 0, background: 'linear-gradient(90deg, rgba(6,20,31,.95) 0%, rgba(0,58,93,.82) 42%, rgba(6,20,31,.2) 80%)' })} />
      <div style={abs({ inset: 0, WebkitMaskImage: mask, maskImage: mask })}>
        {[0, 1, 2, 3].map((L) => {
          const p = MOTION.enter(T, s + 0.15 + L * 0.35, 1.4);
          const side = L % 2 ? 1 : -1;
          return (
            <Img
              key={L}
              src={staticFile(`assets/flakes-${L}.png`)}
              alt=""
              style={abs({ left: 0, top: 0, width: W, height: H, opacity: clamp(p * 2, 0, 1), transform: `translate(${(1 - p) * 120 * side}px, ${(1 - p) * -760}px) rotate(${(1 - p) * 6 * side}deg)` })}
            />
          );
        })}
      </div>
      <div style={abs({ left: 120, top: 160, display: 'flex', flexDirection: 'column', gap: 16 })}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Tag at={s + 0.2} bg={C.red}>Day 2 Only · 15 Oct</Tag>
          <Tag at={s + 0.3}>AutoTech</Tag>
        </div>
        <Reveal at={s + 0.4}><div style={tx(170, 900)}>Floor coating</div></Reveal>
        <Reveal at={s + 0.55}><div style={tx(170, 900, C.blue)}>Systems</div></Reveal>
        <Reveal at={s + 0.8}><div style={tx(42, 300, C.soft, F.cn, { letterSpacing: '.04em', marginTop: 8 })}>Epoxy Floor Coating 8L · Manhattan, Carbon &amp; Sterling Grey</div></Reveal>
        <div style={{ display: 'flex', gap: 70, alignItems: 'flex-start', marginTop: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Price at={s + 1.0} value={207.42} was={218.34} unit={'EX GST\n8L KIT'} size={150} />
            <Chips at={s + 1.6} colours={swatch} size={44} gap={26} labels />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, borderLeft: `4px solid ${C.blue}`, paddingLeft: 34 }}>
            <Reveal at={s + 1.3}><div style={tx(32, 700, '#fff', F.cn, { letterSpacing: '.05em' })}>Decorative Flakes</div></Reveal>
            <Price at={s + 1.4} value={13.38} was={14.08} unit={'EX GST\nGREY · BLUE BLEND'} size={96} />
          </div>
        </div>
        <SaveTag at={s + 2.0} text="Save 5%" size={36} style={{ marginTop: 10 }} />
      </div>
      <Pack id="pk-epoxy" ph="AutoTech Epoxy Floor Coating 8L (cut-out PNG)" x={1220} y={200} w={620} h={560} rot={0} at={s + 0.5} />
    </Scene>
  );
}

// 10. Close — logo reveal, then fade to navy for the loop seam
export function Close() {
  const { T, s, e } = useSpan('Close');
  const plate = MOTION.enter(T, s + 0.3, 1.0);
  const logo = MOTION.enter(T, s + 0.7, 1.0);
  const sweep = clamp((T - (s + 1.2)) / 0.9, 0, 1);
  const fade = MOTION.draw(T, e - 0.7, 0.7);
  const item = (at: number, text: string) => (
    <Reveal at={at} dir="left">
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Img src={staticFile('assets/tick.svg')} alt="" style={{ width: 26, filter: 'brightness(0) invert(1)' }} />
        </div>
        <span style={tx(44, 800, '#fff', F.cn, { letterSpacing: '.03em' })}>{text}</span>
      </div>
    </Reveal>
  );
  return (
    <Scene name="Close" bg={C.deep}>
      <div style={abs({ inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #003A5D, #06141F 75%)' })} />
      <div style={abs({ inset: 0, background: C.blue, transform: `translateX(${(1 - MOTION.enter(T, s + 0.1, 1.2)) * -2200}px)`, clipPath: 'polygon(1560px 0, 1640px 0, 1280px 1080px, 1200px 1080px)' })} />
      <div style={abs({ inset: 0, background: '#fff', transform: `translateX(${(1 - MOTION.enter(T, s + 0.2, 1.2)) * -2200}px)`, clipPath: 'polygon(1676px 0, 1682px 0, 1322px 1080px, 1316px 1080px)' })} />
      <div style={abs({ left: 260, top: 150, width: 1000, height: 400, background: '#fff', transform: `skewX(-18deg) scaleX(${plate})`, transformOrigin: 'left center' })} />
      <div style={abs({ left: 330, top: 190, width: 820, height: 320, overflow: 'hidden', opacity: logo, transform: `translateX(${(1 - logo) * -60}px)` })}>
        <Img src={staticFile('assets/dymark-logo.png')} alt="Dy-Mark" style={{ width: 680, display: 'block', margin: '0 auto' }} />
        <div style={abs({ inset: 0, background: `linear-gradient(110deg, rgba(255,255,255,0) ${sweep * 140 - 30}%, rgba(255,255,255,.75) ${sweep * 140 - 14}%, rgba(255,255,255,0) ${sweep * 140}%)` })} />
      </div>
      <div style={abs({ left: 200, top: 630, display: 'flex', flexDirection: 'column', gap: 26 })}>
        <Reveal at={s + 1.2}><div style={tx(120, 900)}>Visit the Dy-Mark stand</div></Reveal>
        <div style={{ display: 'flex', gap: 54 }}>
          {item(s + 1.6, 'Conference specials')}
          {item(s + 1.8, 'Product demonstrations')}
        </div>
        <Reveal at={s + 2.2} dir="left">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <span style={tx(28, 700, '#fff', F.ex, { letterSpacing: '.1em' })}>Conference specials 5–23 Oct · Day 2 only specials 15 Oct</span>
            <span style={tx(28, 500, C.soft, F.ex, { letterSpacing: '.1em' })}>sales@dymark.com.au · 1300 396 275</span>
          </div>
        </Reveal>
      </div>
      <div style={abs({ inset: 0, background: C.deep, opacity: fade, zIndex: 5 })} />
    </Scene>
  );
}
