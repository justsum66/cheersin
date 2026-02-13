export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
}

export const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
}

export const slideDown = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
}

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: "easeOut" as const }
    }
}

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

export const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 }
}

export const buttonTap = {
    scale: 0.95,
    transition: { duration: 0.1 }
}

export const cardHover = {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.3, type: "spring" as const, stiffness: 300 }
}

export const cardHover3D = {
    scale: 1.03,
    rotateX: 2,
    rotateY: -2,
    z: 15,
    transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] as const }
}
