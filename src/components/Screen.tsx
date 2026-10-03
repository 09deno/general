type ScreenProps = {
  title: string
  description: string
}

// Zatiaľ prázdna obrazovka sekcie – obsah pribudne v ďalších fázach.
export default function Screen({ title, description }: ScreenProps) {
  return (
    <section className="screen">
      <header className="screen__header">
        <span className="brand">Fit denník</span>
        <h1 className="screen__title">{title}</h1>
      </header>

      <div className="card card--glow placeholder">
        <span className="placeholder__label">Pripravujeme</span>
        <p className="placeholder__text">{description}</p>
      </div>
    </section>
  )
}
