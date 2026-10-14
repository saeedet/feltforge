import { StrictMode, useEffect, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Card,
  CardBack,
  Chip,
  ChipStack,
  PokerMarker,
  PokerTable,
} from '@feltforge/react';
import { RANKS, SUITS, COMPACT_CARD } from '@feltforge/core';
import type {
  Rank,
  Suit,
  CourtRank,
  CourtStyle,
  TableLayout,
  CompactCardSize,
} from '@feltforge/core';
import type { ThemeStyle } from '@feltforge/react';
import type { CourtArtwork, JokerArtwork } from '@feltforge/assets/types';
import FlipCard from './components/react-bits/FlipCard';
import './style.css';

const loaders = {
  persian: () =>
    import('@feltforge/assets/courts/persian').then((m) => m.persian),
  western: () =>
    import('@feltforge/assets/courts/western').then((m) => m.western),
  eastern: () =>
    import('@feltforge/assets/courts/eastern').then((m) => m.eastern),
};
const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
function PlaygroundCard({
  front,
  label,
  width,
  height = width * 1.4,
  radius = (width * 13) / 250,
  className = '',
  ...props
}: {
  front: ReactNode;
  label: string;
  width: number;
  height?: number;
  radius?: number;
  className?: string;
} & Pick<
  ComponentProps<typeof FlipCard>,
  'flipped' | 'defaultFlipped' | 'onFlipChange' | 'shadow'
>) {
  return (
    <FlipCard
      front={front}
      back={
        <CardBack
          width={width}
          height={height}
          style={{ borderRadius: radius, overflow: 'hidden' }}
          decorative
        />
      }
      width={width}
      height={height}
      radius={radius}
      background="transparent"
      glareOpacity={0.12}
      shadowOpacity={0.18}
      tiltMax={9}
      shadow={false}
      className={`playground-card ${className}`}
      ariaLabel={label}
      {...props}
    />
  );
}

function App() {
  const [compactSize, setCompactSize] = useState<CompactCardSize>('community');
  const [compactZoom, setCompactZoom] = useState(1);
  const [cardShadow, setCardShadow] = useState('design');
  const [customCardShadow, setCustomCardShadow] = useState(
    '0 4px 16px rgba(35, 86, 62, .3)',
  );
  const compact = COMPACT_CARD[compactSize];
  const [tab, setTab] = useState('Cards'),
    [style, setStyle] = useState<CourtStyle>('persian'),
    [court, setCourt] = useState<CourtArtwork | null>(null),
    [jokers, setJokers] = useState<JokerArtwork[]>([]),
    [error, setError] = useState('');
  const [suit, setSuit] = useState<Suit>('hearts'),
    [cardWidth, setCardWidth] = useState(132),
    [allSuits, setAllSuits] = useState(false),
    [flipped, setFlipped] = useState(false);
  const [value, setValue] = useState(250),
    [count, setCount] = useState(5),
    [cap, setCap] = useState(5),
    [shadow, setShadow] = useState(false),
    [color, setColor] = useState('#0c7a7c');
  const [layout, setLayout] = useState<TableLayout>(6),
    [tableWidth, setTableWidth] = useState(1000),
    [dealer, setDealer] = useState(0);
  useEffect(() => {
    let active = true;
    setCourt(null);
    void loaders[style]()
      .then((x) => {
        if (active) setCourt(x);
      })
      .catch(() => {
        if (active)
          setError('Artwork could not load. Please reload to try again.');
      });
    return () => {
      active = false;
    };
  }, [style]);
  useEffect(() => {
    void Promise.all([
      import('@feltforge/assets/jokers/1').then((m) => m.joker1),
      import('@feltforge/assets/jokers/2').then((m) => m.joker2),
    ])
      .then(setJokers)
      .catch(() => setError('Joker artwork could not load.'));
  }, []);
  function card(rank: Rank, s: Suit, width: number) {
    if (['J', 'Q', 'K'].includes(rank))
      return court ? (
        <Card rank={rank as CourtRank} suit={s} court={court} width={width} />
      ) : (
        <span
          className="card-loading"
          style={{ width }}
          aria-label="Loading court artwork"
        />
      );
    return (
      <Card rank={rank as Exclude<Rank, CourtRank>} suit={s} width={width} />
    );
  }
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#top">
          <span aria-hidden="true">♠</span> feltforge
        </a>
        <nav aria-label="Primary">
          <a href="#explore">Explore the library</a>
          <a
            href="https://github.com/saeedet/feltforge"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </nav>
        <span className="release">PLAYGROUND</span>
      </header>
      <main
        id="top"
        style={
          cardShadow === 'design'
            ? undefined
            : ({
                '--card-shadow':
                  cardShadow === 'none' ? 'none' : customCardShadow,
              } as ThemeStyle)
        }
      >
        <section className="hero">
          <div>
            <p className="eyebrow">THE VISUAL TOOLKIT FOR YOUR NEXT TABLE</p>
            <h1>
              Good hands.
              <br />
              <em>Great interfaces.</em>
            </h1>
            <p className="intro">
              Beautifully drawn cards. Crisp chips. A place for every player.
              Composable React primitives, built from one carefully crafted
              design system.
            </p>
            <a className="primary" href="#explore">
              Explore the components <span>↓</span>
            </a>
            <div className="hero-meta">
              <span>31 vector assets</span>
              <span>3 court styles</span>
              <span>Open source</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-back">
              <CardBack width={215} decorative />
            </div>
            <div className="hero-ace">
              <Card rank="A" suit="spades" width={215} decorative />
            </div>
            <div className="hero-court">
              {court ? (
                <Card
                  rank="K"
                  suit="hearts"
                  court={court}
                  width={215}
                  decorative
                />
              ) : (
                <Card rank="7" suit="hearts" width={215} decorative />
              )}
            </div>
            <div className="hero-chip">
              <ChipStack value={25} count={5} size={72} shadow decorative />
            </div>
            <span className="art-caption">
              DRAWN WITH CARE. BUILT TO COMPOSE.
            </span>
          </div>
        </section>
        <section id="explore" className="explorer">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMPONENT ATLAS</p>
              <h2>Make it your own.</h2>
            </div>
            <p>Change the details. See the whole picture.</p>
          </div>
          <div className="tabs" aria-label="Component categories">
            {['Cards', 'Chips & markers', 'Poker table'].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
              >
                {t}
                <span>
                  {t === 'Cards' ? '01' : t === 'Chips & markers' ? '02' : '03'}
                </span>
              </button>
            ))}
          </div>
          {error && <p role="alert">{error}</p>}
          {tab === 'Cards' && (
            <section aria-label="Card gallery">
              <div className="toolbar">
                <label>
                  Court collection
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as CourtStyle)}
                  >
                    <option value="persian">Persian</option>
                    <option value="western">Western</option>
                    <option value="eastern">Eastern</option>
                  </select>
                </label>
                <fieldset>
                  <legend>Suit</legend>
                  {SUITS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={
                        s === 'hearts' || s === 'diamonds' ? 'red' : ''
                      }
                      aria-label={s}
                      aria-pressed={suit === s}
                      onClick={() => setSuit(s)}
                    >
                      {suitSymbols[s]}
                    </button>
                  ))}
                </fieldset>
                <label>
                  Card width{' '}
                  <span className="control-value" aria-hidden="true">
                    {cardWidth}px
                  </span>
                  <input
                    aria-label="Card width"
                    type="range"
                    min="100"
                    max="250"
                    value={cardWidth}
                    onChange={(e) => setCardWidth(Number(e.target.value))}
                  />
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={allSuits}
                    onChange={(e) => setAllSuits(e.target.checked)}
                  />
                  All 52 cards
                </label>
                <label>
                  Card shadow
                  <select
                    value={cardShadow}
                    onChange={(e) => setCardShadow(e.target.value)}
                  >
                    <option value="design">Original shadow</option>
                    <option value="none">None</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
                {cardShadow === 'custom' && (
                  <label>
                    Custom shadow
                    <input
                      aria-label="Custom card shadow"
                      value={customCardShadow}
                      onChange={(e) => setCustomCardShadow(e.target.value)}
                    />
                  </label>
                )}
              </div>
              <section className="flip-lab" aria-labelledby="flip-heading">
                <div className="flip-copy">
                  <p className="eyebrow">A LITTLE HANDS-ON MAGIC</p>
                  <h3 id="flip-heading">Give it a spin.</h3>
                  <p>
                    Click to flip. Drag sideways and let go. The card follows
                    your hand, then settles into place.
                  </p>
                  <p className="flip-hint">
                    Keyboard: focus the card and press Enter or Space.
                  </p>
                  <div className="flip-actions">
                    <button type="button" onClick={() => setFlipped(!flipped)}>
                      {flipped ? 'Show face' : 'Show back'}{' '}
                      <span aria-hidden="true">↻</span>
                    </button>
                    <span role="status">
                      {flipped ? 'Classic back' : `King of ${suit}`}
                    </span>
                  </div>
                  <a
                    className="flip-credit"
                    href="https://reactbits.dev/components/flip-card"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Flip & drag by React Bits ↗
                  </a>
                </div>
                <div className="flip-stage">
                  <span className="flip-stage-label" aria-hidden="true">
                    FLIP & DRAG
                  </span>
                  <PlaygroundCard
                    front={card('K', suit, 220)}
                    label={`Flip King of ${suit}`}
                    width={220}
                    flipped={flipped}
                    onFlipChange={setFlipped}
                  />
                </div>
              </section>
              <div className="gallery" aria-label="Playing cards">
                {(allSuits ? SUITS : [suit]).flatMap((s) =>
                  RANKS.map((r) => (
                    <PlaygroundCard
                      key={r + s}
                      label={`Flip ${r} of ${s}`}
                      front={card(r, s, cardWidth)}
                      width={cardWidth}
                    />
                  )),
                )}
              </div>
              <section
                className="compact-lab"
                aria-labelledby="compact-heading"
              >
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">SMALL CARDS. CLEAR HANDS.</p>
                    <h3 id="compact-heading">Made for mobile.</h3>
                  </div>
                  <p>
                    Bold ranks and two suit symbols, drawn for small tables.
                  </p>
                </div>
                <div className="toolbar">
                  <label>
                    Compact size
                    <select
                      value={compactSize}
                      onChange={(e) =>
                        setCompactSize(e.target.value as CompactCardSize)
                      }
                    >
                      <option value="community">Community · 38 × 53</option>
                      <option value="hero">Hero · 50 × 70</option>
                    </select>
                  </label>
                  <label>
                    Magnification
                    <select
                      value={compactZoom}
                      onChange={(e) => setCompactZoom(Number(e.target.value))}
                    >
                      <option value="1">Actual size</option>
                      <option value="4">4× close-up</option>
                    </select>
                  </label>
                </div>
                <div
                  className="compact-samples"
                  aria-label="Compact design samples"
                >
                  {(['A', '7', '10', 'Q', 'K'] as const).map((rank, i) => {
                    const s = (
                      [
                        'spades',
                        'diamonds',
                        'clubs',
                        'hearts',
                        'spades',
                      ] as const
                    )[i]!;
                    return (
                      <PlaygroundCard
                        key={rank}
                        label={`Flip compact sample ${rank}`}
                        front={
                          <Card
                            variant="compact"
                            size={compactSize}
                            rank={rank}
                            suit={s}
                            width={compact.width * compactZoom}
                            aria-label={`Compact sample ${rank} of ${s}`}
                          />
                        }
                        width={compact.width * compactZoom}
                        height={compact.height * compactZoom}
                        radius={compact.radius * compactZoom}
                      />
                    );
                  })}
                </div>
                <p className="note">
                  {compactZoom === 1
                    ? 'Actual pixel sizes'
                    : 'Magnified for a closer look'}{' '}
                  · {compact.width} × {compact.height} · Courts share the same
                  clear rank and suit treatment.
                </p>
                <div className="compact-hand-demo">
                  <div>
                    <p>COMMUNITY · 38 × 53</p>
                    <div className="compact-community">
                      {(['A', '7', '10', 'Q', 'K'] as const).map((rank, i) => (
                        <Card
                          key={rank}
                          variant="compact"
                          rank={rank}
                          suit={
                            (
                              [
                                'spades',
                                'diamonds',
                                'clubs',
                                'hearts',
                                'spades',
                              ] as const
                            )[i]!
                          }
                          aria-label={`Compact community ${rank}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p>YOUR HAND · 50 × 70</p>
                    <div className="compact-hero-pair">
                      <Card
                        variant="compact"
                        size="hero"
                        rank="Q"
                        suit="hearts"
                        aria-label="Compact hero Queen"
                      />
                      <Card
                        variant="compact"
                        size="hero"
                        rank="K"
                        suit="spades"
                        aria-label="Compact hero King"
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="compact-gallery"
                  aria-label="Compact playing cards"
                >
                  {(allSuits ? SUITS : [suit]).flatMap((s) =>
                    RANKS.map((rank) => (
                      <PlaygroundCard
                        key={rank + s}
                        label={`Flip compact ${rank} of ${s}`}
                        front={
                          <Card
                            variant="compact"
                            size={compactSize}
                            rank={rank}
                            suit={s}
                            aria-label={`Compact ${rank} of ${s}`}
                          />
                        }
                        width={compact.width}
                        height={compact.height}
                        radius={compact.radius}
                      />
                    )),
                  )}
                </div>
                <pre>
                  <code>{`<Card variant="compact" size="${compactSize}" rank="K" suit="spades" />\n<Card variant="compact" rank="10" suit="clubs" />\n// Optional shadow override:\n<Card rank="7" suit="hearts" style={{ '--card-shadow': 'none' }} />`}</code>
                </pre>
              </section>
              <div className="special-row">
                <div>
                  <p className="eyebrow">SHARED ACROSS COLLECTIONS</p>
                  <h3>A few wild cards.</h3>
                  <p>
                    Two distinct Jokers and a classic, symmetrical back complete
                    the set.
                  </p>
                </div>
                <div className="special-cards">
                  {jokers.map((artwork) => (
                    <PlaygroundCard
                      key={artwork.variant}
                      label={`Flip Joker ${artwork.variant}`}
                      front={
                        <Card rank="joker" artwork={artwork} width={132} />
                      }
                      width={132}
                    />
                  ))}
                  <PlaygroundCard
                    label="Flip Classic back"
                    front={card('A', 'spades', 132)}
                    width={132}
                    defaultFlipped
                  />
                </div>
              </div>
              <pre>
                <code>{`import { Card } from 'feltforge';\nimport { ${style} } from 'feltforge/courts/${style}';\n\n<Card rank="K" suit="${suit}" court={${style}} />\n<Card rank="7" suit="${suit}" />`}</code>
              </pre>
            </section>
          )}
          {tab === 'Chips & markers' && (
            <section aria-label="Chip and marker gallery">
              <div className="denominations">
                {[1, 5, 25, 100, 500, 1000, 5000].map((v) => (
                  <div key={v}>
                    <Chip value={v} size={72} />
                    <span>{v.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="chip-lab">
                <div className="toolbar vertical">
                  <label>
                    Custom denomination
                    <input
                      aria-label="Custom denomination"
                      type="number"
                      min="0"
                      max="1000000"
                      value={value}
                      onChange={(e) =>
                        setValue(
                          Math.max(
                            0,
                            Math.min(1000000, Number(e.target.value)),
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Base colour
                    <input
                      aria-label="Base colour"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </label>
                  <label>
                    Chip count{' '}
                    <span className="control-value" aria-hidden="true">
                      {count}
                    </span>
                    <input
                      aria-label="Chip count"
                      type="range"
                      min="0"
                      max="50"
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Visible limit{' '}
                    <span className="control-value" aria-hidden="true">
                      {cap}
                    </span>
                    <input
                      aria-label="Visible limit"
                      type="range"
                      min="1"
                      max="8"
                      value={cap}
                      onChange={(e) => setCap(Number(e.target.value))}
                    />
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={shadow}
                      onChange={(e) => setShadow(e.target.checked)}
                    />
                    Subtle shadow
                  </label>
                </div>
                <div className="chip-stage">
                  <Chip value={value} color={color} size={112} />
                  <ChipStack
                    value={value}
                    count={count}
                    color={color}
                    maxVisible={cap}
                    size={112}
                    shadow={shadow}
                  />
                  <div>
                    <strong>{count} chips</strong>
                    <span>Total value: {(value * count).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="marker-row">
                <div>
                  <p className="eyebrow">THE LITTLE DETAILS</p>
                  <h3>A seat at the table.</h3>
                </div>
                {(['dealer', 'small-blind', 'big-blind'] as const).map(
                  (type) => (
                    <div key={type}>
                      <PokerMarker type={type} size={64} />
                      <span>{type.replace('-', ' ')}</span>
                    </div>
                  ),
                )}
              </div>
              <p className="note">
                Denomination colours are configurable defaults. They are not
                universal casino standards.
              </p>
              <pre>
                <code>{`<Chip value={${value}} color="${color}" />\n<ChipStack value={${value}} count={${count}} maxVisible={${cap}} />\n<PokerMarker type="dealer" />`}</code>
              </pre>
            </section>
          )}
          {tab === 'Poker table' && (
            <section aria-label="Poker table preview">
              <div className="toolbar">
                <label>
                  Seats
                  <select
                    aria-label="Seats"
                    value={layout}
                    onChange={(e) => {
                      setLayout(Number(e.target.value) as TableLayout);
                      setDealer(0);
                    }}
                  >
                    {[2, 6, 8, 9].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Table width{' '}
                  <span className="control-value" aria-hidden="true">
                    {tableWidth}px
                  </span>
                  <input
                    aria-label="Table width"
                    type="range"
                    min="500"
                    max="1000"
                    step="100"
                    value={tableWidth}
                    onChange={(e) => setTableWidth(Number(e.target.value))}
                  />
                </label>
                <label>
                  Dealer seat
                  <select
                    aria-label="Dealer seat"
                    value={dealer}
                    onChange={(e) => setDealer(Number(e.target.value))}
                  >
                    {Array.from({ length: layout }, (_, i) => (
                      <option key={i} value={i}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="table-scroll">
                <div className="table-preview" style={{ width: tableWidth }}>
                  <PokerTable
                    layout={layout}
                    renderSeat={(s) => (
                      <div
                        className={`seat ${s.index === 0 ? 'hero-seat' : ''}`}
                      >
                        <span className="avatar">
                          {s.index === 0 ? 'Y' : String(s.index + 1)}
                        </span>
                        <div>
                          <strong>
                            {s.index === 0 ? 'You' : `Player ${s.index + 1}`}
                          </strong>
                          <small>
                            {(2500 + s.index * 500).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    )}
                    renderBet={(s) => (
                      <ChipStack
                        value={s.index % 2 ? 25 : 100}
                        count={(s.index % 3) + 1}
                        size={38}
                        style={{
                          width: 'clamp(32px, 4.6cqw, 48px)',
                          height: 'auto',
                        }}
                      />
                    )}
                    renderMarker={(s) =>
                      s.index === dealer ? (
                        <PokerMarker type="dealer" />
                      ) : s.index === (dealer + 1) % layout ? (
                        <PokerMarker type="small-blind" />
                      ) : s.index === (dealer + 2) % layout ? (
                        <PokerMarker type="big-blind" />
                      ) : null
                    }
                    pot={
                      <div className="pot">
                        POT <strong>1,250</strong>
                      </div>
                    }
                    community={
                      <>
                        {(['A', '7', '10'] as const).map((rank, i) => (
                          <PlaygroundCard
                            key={rank}
                            label={`Flip community ${rank}`}
                            front={card(
                              rank,
                              (['spades', 'hearts', 'diamonds'] as const)[i]!,
                              84,
                            )}
                            width={84}
                            className="community-card"
                          />
                        ))}
                        {(['K', 'Q'] as const).map((rank) => (
                          <PlaygroundCard
                            key={rank}
                            label={`Flip hidden community ${rank}`}
                            front={card(rank, 'spades', 84)}
                            width={84}
                            className="community-card"
                            defaultFlipped
                          />
                        ))}
                      </>
                    }
                  />
                </div>
              </div>
              <p className="note">
                The table scales proportionally. Seats, chips and markers keep
                independent sizes. 800px or wider is recommended for a full
                interface.
              </p>
              <pre>
                <code>{`<PokerTable\n  layout={${layout}}\n  renderSeat={({ index }) => <PlayerPanel seat={index} />}\n  renderBet={() => <ChipStack value={25} count={3} />}\n/>`}</code>
              </pre>
            </section>
          )}
        </section>
        <section className="principles">
          <div>
            <span>01 / COMPOSABLE</span>
            <h3>Small pieces. Complete scenes.</h3>
            <p>
              Cards share ranks, suits and geometry. Tables give your interface
              precise anchors.
            </p>
          </div>
          <div>
            <span>02 / CONSIDERED</span>
            <h3>Details that travel well.</h3>
            <p>
              Vector artwork, proportional scaling and accessible labels from
              the start.
            </p>
          </div>
          <div>
            <span>03 / OPEN</span>
            <h3>Yours to build on.</h3>
            <p>
              Typed React components with a framework-independent core. MIT
              licensed.
            </p>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="#top">
          ♠ feltforge
        </a>
        <p>Visual primitives. Endless possibilities.</p>
        <a href="https://github.com/saeedet/feltforge">View source ↗</a>
      </footer>
    </>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Playground root missing');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
