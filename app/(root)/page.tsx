import Link from "next/link";

export default function Home() {
  return (
    <div className="ascii-art z-20">
      <div className="max-w-7xl mx-auto mt-15">
        <main className="space-y-16 py-8">
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <p className="ascii-scale text-1xl md:text-1xl font-bold bg-gradient-to-r from-gray to-white bg-clip-text text-transparent whitespace-pre font-mono leading-tight">
              {`
 ____                                            
|  _ \\  __ _ _ __ ___   __ _ _ __ ___  ___ _ __  
| | | |/ _\` | '_ \` _ \\ / _\` | '__/ _ \\/ _ \\ '_ \\ 
| |_| | (_| | | | | | | (_| | | |  __/  __/ | | |
|____/ \\__,_|_| |_| |_|\\__,_|_|  \\___|\\___|_| |_|
`}
            </p>

            <p className="text-2xl text-gray-300 max-w-2xl mx-auto mt-10">
              Egy fantasy kártyajáték, ahol stratégia és
              képzelet fonódik össze. Teremts hősöket, járd végig a kazamatákat,
              és írd fel saját történelmed a paklid lapjaira.
            </p>
            <div className="space-x-4">
              <Link
                  href="/dashboard"
                  className="relative hover:bg-green-900/20 inline-block px-10 py-4 font-mono text-2xl font-bold text-green-300 border-2 border-green-800 rounded-lg transition-all duration-300 hover:text-green-100 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] hover:border-green-500 group"
              >
                <span className="relative z-10">▶ Játssz most</span>
                <span className="absolute inset-0   opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></span>
              </Link>
            </div>
          </section>

          {/* Funkciók */}
          <section className="grid md:grid-cols-3 gap-8 py-12">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-gray-500 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">/!\</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Stratégiai Játékmenet</h3>
              <p className="text-gray-400">
                Uralkodj a hőseidet és kazamatacsatákat formáló
                kártyakombinációk művészetén, és építs olyan taktikát, amellyel
                végigküzdöd magad minden kihíváson.
              </p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-gray-500 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">~*~</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Fantasy Világ</h3>
              <p className="text-gray-400">
                Merülj el egy mágikus birodalomban, ahol hősök születnek,
                kazamaták várnak felfedezésre, és minden kártya egy újabb
                legendát hordoz.
              </p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-gray-500 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">/\/\</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Kihívások és Kazamaták</h3>
              <p className="text-gray-400">
                Győzd le az egyre erősebb kazamatákat, ezeknek vezéreit, és
                fejleszd kártyáidat a végtelen fejlődés útján.
              </p>
            </div>
          </section>

          {/* Hogyan játssz */}
          <section className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-center mb-12">
              Hogyan Játsz?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "I",
                  title: "Világ Létrehozása",
                  desc: "A játékmester meghatározza a világkártyákat, a típusokat, megszabja a játékosok kártyáit, és felépíti a kazamatákat.",
                },
                {
                  step: "II",
                  title: "Pakli Összeállítása",
                  desc: "A gyűjteményből a játékos összeállítja a harcra szánt paklit a kazamata kihívásaihoz igazodva.",
                },
                {
                  step: "III",
                  title: "Kazamata Meghódítása",
                  desc: "Válassz kihívást, majd csatázz végig a kazamatán. A sebzés, életerő és típusok döntik el az összecsapásokat.",
                },
                {
                  step: "IV",
                  title: "Fejlődés és Folytatás",
                  desc: "Győzelem esetén fejlesztheted egy kártyádat, majd új paklit állíthatsz össze a következő kalandhoz.",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-2xl mb-2 mt-5">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-1xl mt-5">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12">
            <h2 className="text-4xl font-bold mb-6">
              Készen állsz a kihívásra?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Csatlakozz a hősök birodalmához, és merülj el a végtelenül
              fejleszthető fantasy kártyajáték élményében.
            </p>
            <Link
                href="/dashboard"
                className="relative hover:bg-green-900/20 inline-block px-10 py-4 font-mono text-2xl font-bold text-green-300 border-2 border-green-800 rounded-lg transition-all duration-300 hover:text-green-100 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] hover:border-green-500 group"
            >
              <span className="relative z-10">▶ Játssz most ingyen</span>
              <span className="absolute inset-0   opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></span>
            </Link>
          </section>
        </main>
      </div>
      <footer className="footer text-amber-50 py-16 px-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <img src="/img/logo.svg" alt="Logo" className="w-20 h-20" />
                <h3 className="text-2xl font-bold text-amber-50">
                  Szegfűsor
                  <span className="text-amber-400"></span>
                </h3>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-6 text-amber-400">
                Csapattagok
              </h4>
              <div className="space-y-4 text-amber-100 opacity-75 text-lg">
                <p>Sőrés Máté</p>
                <p>Belényesi István</p>
                <p>Menyhért Bence</p>
              </div>
            </div>
          </div>
          <div className={"text-center"}>
            <p className={"space-y-4 text-amber-100 opacity-75 text-lg"}>
              © 2025 Minden jog fenntartva
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
