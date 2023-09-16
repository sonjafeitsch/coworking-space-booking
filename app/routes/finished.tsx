export default function Finished() {
  return (
    <div className="flex flex-col justify-start w-full p-16 sm:p-0 sm:w-1/2 gap-8">
      <div className="flex flex-col justify-start lg:max-w-lg gap-4">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-themed-text font-serif sm:text-4xl">
          Danke für deine Reservierung
        </h1>
        <p className="mt-6 text-base leading-6 text-themed-base-text">
          Wir überprüfen deine Anfrage und senden dir eine Bestätigung per
          E-Mail zu.
        </p>
        <p className="text-base leading-6 text-themed-base-text">
          <span className="font-semibold">Wichtig:</span> erst nach Erhalt der
          E-Mail ist deine Buchung final bestätigt. Wenn du Fragen hast,
          schreibe einfach an hallo@meine-nische.de.
        </p>
      </div>
    </div>
  );
}
