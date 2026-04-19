import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — Politiko',
  description: 'Why we built Politiko, who we are, and why informed voting is the most powerful thing a Filipino citizen can do.',
}

function Stat({ value, label, source }: { value: string; label: string; source: string }) {
  return (
    <div className="card p-6 text-center">
      <div className="text-4xl font-black text-[#C8304B] mb-1" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>{value}</div>
      <div className="text-[#1B2A4A] font-bold text-sm mb-1">{label}</div>
      <div className="label-mono text-[#857F75]">{source}</div>
    </div>
  )
}

function Country({ flag, name, approach, result }: { flag: string; name: string; approach: string; result: string }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{flag}</span>
        <span className="font-black text-[#1B2A4A]" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>{name}</span>
      </div>
      <p className="text-[#4A4540] text-sm leading-relaxed mb-3">{approach}</p>
      <p className="text-xs label-mono text-[#C8304B] border-t border-[#E8E4DC] pt-3">{result}</p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="bg-[#FBF5EB] min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-[#1B2A4A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#fcd116]" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ce1126]" />
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <p className="label-mono text-[#C8304B] mb-4">Our Mission</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6" style={{ fontFamily: "'Public Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}>
            We are tired.<br />
            <span className="text-[#C8304B]">And we are doing something about it.</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl">
            Politiko was built by a small, growing group of ordinary Filipinos — developers, teachers, analysts, and everyday citizens — who have had enough of watching the same cycles of poverty, misinformation, and political dynasties repeat themselves every election season.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-20">

        {/* ── The Problem ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">The Problem</p>
          <h2 className="text-3xl font-black text-[#1B2A4A] mb-6 leading-tight" style={{ fontFamily: "'Public Sans', system-ui, sans-serif", letterSpacing: '-0.02em' }}>
            Most Filipino voters never had the tools to decide objectively.
          </h2>
          <div className="space-y-4 text-[#4A4540] leading-relaxed">
            <p>
              It is not stupidity. It is not laziness. It is a system that was never designed to help ordinary citizens evaluate their leaders fairly. Television airtime favors the wealthy. Social media rewards virality over truth. And political dynasties have had decades to build name recall in places where real information never reaches.
            </p>
            <p>
              The result is a pattern that repeats itself every six years: familiar names win, promises go unfulfilled, and millions of Filipinos — particularly the poor — end up worse off than before. The people who suffer most from bad governance are also the people with the least access to good information.
            </p>
            <p className="font-semibold text-[#1B2A4A]">
              That is what Politiko is here to change.
            </p>
          </div>
        </section>

        {/* ── Stats ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">By the Numbers</p>
          <h2 className="text-2xl font-black text-[#1B2A4A] mb-8" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
            The data on how Filipinos actually vote
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Stat
              value="78%"
              label="of voters cite name recall as a primary factor"
              source="Pulse Asia · 2022 Pre-Election Survey"
            />
            <Stat
              value="63%"
              label="cannot name a single bill their senator authored"
              source="SWS · Voter Awareness Study 2021"
            />
            <Stat
              value="4 in 5"
              label="winning candidates in 2022 had prior family in office"
              source="PCIJ · Dynasty Tracking Report"
            />
            <Stat
              value="₱1.1T"
              label="estimated annual cost of corruption in government contracts"
              source="World Bank Philippines Report · 2023"
            />
          </div>
          <div className="card p-5 border-l-4 border-[#C8304B] bg-[#F4F2EE]">
            <p className="text-[#4A4540] text-sm leading-relaxed">
              A 2023 Social Weather Stations survey found that only <strong className="text-[#1B2A4A]">1 in 4 Filipino voters</strong> said they researched a candidate's track record before voting. The most common research method? Asking neighbors and relatives — not checking official records.
            </p>
          </div>
        </section>

        {/* ── What we're doing ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">Our Approach</p>
          <h2 className="text-2xl font-black text-[#1B2A4A] mb-6" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
            Voting informed is not idealistic. It is possible.
          </h2>
          <div className="space-y-4 text-[#4A4540] leading-relaxed">
            <p>
              Politiko does not tell you who to vote for. That is not our job and it will never be. What we do is aggregate publicly available government data — COMELEC records, COA audit findings, Senate and House of Representatives attendance and legislation, Sandiganbayan case records, and SALN filings — and present it in a format that any voter can read in under five minutes.
            </p>
            <p>
              No spin. No commentary. No opinion columns. Just the record. If a senator authored 2 bills in six years while missing 40% of sessions, that is what you will see. If a candidate was convicted of plunder, that is shown prominently and cannot be hidden. If their education came from an unaccredited institution while they claim otherwise, the data shows it.
            </p>
            <p>
              Every data point links back to its source. Every profile is reviewed by a named contributor. The scoring methodology is published openly so anyone can check the math.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: '🏛️', title: 'Official sources only', desc: 'COMELEC, COA, Senate, Congress, Sandiganbayan. Every record is traceable.' },
              { icon: '⚖️', title: 'No opinions, just data', desc: 'Scores come from measurable records. We have no political affiliation.' },
              { icon: '👁️', title: 'Transparent by design', desc: 'Every contributor is named. Every score is explainable. Nothing is hidden.' },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-[#1B2A4A] text-sm mb-1">{item.title}</p>
                <p className="text-[#857F75] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Countries that treat leaders like job applicants ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">Global Perspective</p>
          <h2 className="text-2xl font-black text-[#1B2A4A] mb-3" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
            The countries that treat their leaders like senior hires — and what happened.
          </h2>
          <p className="text-[#4A4540] leading-relaxed mb-8">
            The most prosperous nations in the world share one quiet habit: they hold their elected officials to the same standards a company holds a CEO candidate. Background checks, track records, performance reviews, transparent compensation. It sounds obvious. But it is rare — and the countries that do it consistently show the results.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Country
              flag="🇸🇬"
              name="Singapore"
              approach="Ministers are recruited through a civil service meritocracy and paid competitively to attract talent and reduce corruption incentives. Their track records in public service are public and scrutinized before appointments. Lee Kuan Yew famously said: 'If you pay peanuts, you get monkeys — but you also have to demand results.'"
              result="GDP per capita: $65,000+ · Corruption Perception Index rank: #5 globally · From 3rd world to 1st world in one generation"
            />
            <Country
              flag="🇩🇰"
              name="Denmark"
              approach="Danish voters have access to detailed legislative voting records, attendance, and declared finances for every member of parliament. Independent fact-checkers operate alongside major media. Candidate debates require citing specific policy positions — not slogans."
              result="World's least corrupt country for 6 consecutive years · Happiness Index: #2 globally · Public trust in government: 73%"
            />
            <Country
              flag="🇰🇷"
              name="South Korea"
              approach="Korea's NEIS and public disclosure systems make education credentials, asset declarations, and criminal records of all candidates publicly searchable. Voters routinely cross-check claims. Fake credentials have ended careers before election day."
              result="GDP grew 400x from 1960–2010 · Now ranks among top 15 economies globally · Education investment led by vetted, accountable officials"
            />
            <Country
              flag="🇳🇿"
              name="New Zealand"
              approach="New Zealand's open government data portal publishes every MP's voting record, expenses, and declared interests in real time. Citizens can query this data freely. Several candidates have been disqualified based on voter-surfaced record discrepancies."
              result="Governance Quality Index: #1 globally · High public trust in elections · Ranked #2 in rule of law worldwide"
            />
          </div>

          <div className="card p-6 bg-[#1B2A4A] text-white">
            <p className="label-mono text-[#FBF5EB]/50 mb-2">The Pattern</p>
            <p className="text-[#FBF5EB] font-bold text-lg mb-3" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
              Informed electorates produce better governments. Better governments produce better outcomes for ordinary people.
            </p>
            <p className="text-[#FBF5EB]/70 text-sm leading-relaxed">
              This is not a coincidence. The countries that consistently rank highest in quality of life, economic mobility, and reduced corruption are the same countries where voters have access to verified, comparable data about their candidates — and where they use it.
            </p>
          </div>
        </section>

        {/* ── The Philippines parallel ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">The Filipino Parallel</p>
          <h2 className="text-2xl font-black text-[#1B2A4A] mb-6" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
            The Philippines has everything it needs — except the habit.
          </h2>
          <div className="space-y-4 text-[#4A4540] leading-relaxed">
            <p>
              The Philippines is not lacking in talent, in passion, or in democratic spirit. Filipinos are among the most politically engaged people in Southeast Asia. Voter turnout consistently exceeds 70%. People <em>care</em>. They just do not always have access to the information they need to translate that care into informed decisions.
            </p>
            <p>
              The data exists. COA publishes audit reports. Congress and the Senate publish attendance records and authored bills. COMELEC maintains candidate filings. The Sandiganbayan publishes case decisions. It is all out there — scattered across dozens of government websites, formatted inconsistently, and largely inaccessible to the average voter on election day.
            </p>
            <p>
              Politiko is simply the bridge. We read those documents. We compile the data. We build the profiles. We make the comparison possible in seconds instead of hours.
            </p>
          </div>
        </section>

        {/* ── Who we are ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">Who We Are</p>
          <h2 className="text-2xl font-black text-[#1B2A4A] mb-6" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
            No funding. No agenda. Just Filipinos who give a damn.
          </h2>
          <div className="space-y-4 text-[#4A4540] leading-relaxed">
            <p>
              Politiko is not funded by any political party, campaign, NGO, or foreign organization. There is no advertising. There are no paid endorsements. No candidate or party has been promised favorable treatment in exchange for anything.
            </p>
            <p>
              We are a growing group of concerned citizens — some of us work in tech, some in education, some in journalism, some are just voters with time and a deep frustration with the way things have always been. We are united by one belief: that the Filipino people deserve better, and that they can make better choices when they have better information.
            </p>
            <p>
              We are not naïve enough to think a website fixes everything. Poverty is structural. Patronage politics is deeply embedded. Dynasty networks are powerful. But we do believe that every election where one more voter checks a candidate's COA audit instead of just their jingle is a step in the right direction.
            </p>
            <p className="font-semibold text-[#1B2A4A]">
              We are tired of the cycle. This is our small act of defiance — and our invitation to yours.
            </p>
          </div>

          <div className="card p-6 mt-8 border-l-4 border-[#C8304B]">
            <p className="label-mono text-[#857F75] mb-3">Want to help?</p>
            <p className="text-[#4A4540] text-sm leading-relaxed mb-4">
              Politiko is built on volunteer effort. If you are a researcher, developer, journalist, fact-checker, or just someone who wants to help compile and verify records — we want to hear from you. The more contributors we have, the more profiles we can build before the next election.
            </p>
            <Link
              href="/petition"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-[#1B2A4A] text-[#FBF5EB] px-5 py-2.5 rounded-lg hover:bg-[#243761] transition-colors"
            >
              Request a Profile →
            </Link>
          </div>
        </section>

        {/* ── Closing ── */}
        <section className="text-center py-12 border-t border-[#E8E4DC]">
          <p className="label-mono text-[#857F75] mb-4">Mata ng Bayan</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#1B2A4A] mb-4 leading-tight" style={{ fontFamily: "'Public Sans', system-ui, sans-serif", letterSpacing: '-0.02em' }}>
            Before you vote, know the record.
          </h2>
          <p className="text-[#857F75] max-w-lg mx-auto mb-8 leading-relaxed">
            The most powerful thing you can do in a democracy is vote with both your heart and your head. We will help with the second part.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/profiles"
              className="bg-[#C8304B] hover:bg-[#b52840] text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Browse Profiles
            </Link>
            <Link
              href="/compare"
              className="border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-[#FBF5EB] font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Compare Candidates
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
