'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Save, Plus, Trash2, Zap, Heart, Star, Smile, Beer, PartyPopper, Hash, MessageCircle, AlertTriangle, HelpCircle, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCustomGames, type CustomGameCard } from '@/lib/custom-games'
import { useSubscription } from '@/hooks/useSubscription'
import { buttonHover, buttonTap, staggerContainer, slideUp } from '@/lib/animations'
import { v4 as uuidv4 } from 'uuid'

// Predefined icons for selection
const ICON_OPTIONS = [
    { name: 'Zap', icon: Zap },
    { name: 'Heart', icon: Heart },
    { name: 'Star', icon: Star },
    { name: 'Smile', icon: Smile },
    { name: 'Beer', icon: Beer },
    { name: 'PartyPopper', icon: PartyPopper },
    { name: 'Hash', icon: Hash },
    { name: 'MessageCircle', icon: MessageCircle },
    { name: 'AlertTriangle', icon: AlertTriangle },
    { name: 'HelpCircle', icon: HelpCircle },
    { name: 'Trophy', icon: Trophy },
]

const COLOR_OPTIONS = [
    { value: 'primary', label: 'Primary (Pink)', class: 'bg-primary-500' },
    { value: 'secondary', label: 'Secondary (Blue)', class: 'bg-secondary-500' },
    { value: 'accent', label: 'Accent (Purple)', class: 'bg-accent-500' },
    { value: 'white', label: 'White', class: 'bg-white' },
]

export default function CustomGameCreator() {
    const router = useRouter()
    const { addGame } = useCustomGames()
    const { tier } = useSubscription()

    // Form State
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [iconName, setIconName] = useState('Zap')
    const [color, setColor] = useState<'primary' | 'secondary' | 'accent' | 'white'>('primary')
    const [cards, setCards] = useState<CustomGameCard[]>([
        { id: '1', text: '', type: 'plain' }
    ])

    // Validation
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const handleAddCard = () => {
        setCards([...cards, { id: uuidv4(), text: '', type: 'plain' }])
    }

    const handleRemoveCard = (index: number) => {
        if (cards.length <= 1) {
            toast.error('At least one card is required')
            return
        }
        setCards(cards.filter((_, i) => i !== index))
    }

    const handleCardChange = (index: number, field: keyof CustomGameCard, value: string) => {
        const newCards = [...cards]
        newCards[index] = { ...newCards[index], [field]: value }
        setCards(newCards)
    }

    const handleSave = () => {
        // Validate
        const newErrors: { [key: string]: string } = {}
        if (!name.trim()) newErrors.name = 'Game name is required'
        if (!description.trim()) newErrors.description = 'Description is required'
        if (cards.some(c => !c.text.trim())) newErrors.cards = 'All cards must have text'

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors before saving')
            return
        }

        // Save
        try {
            addGame({
                name,
                description,
                iconName,
                color,
                content: cards
            })
            toast.success('Game created successfully!')
            router.push('/games') // Redirect to lobby where it should appear
        } catch (error) {
            toast.error('Failed to save game')
            console.error(error)
        }
    }

    // Permission Check
    if (tier === 'free') {
        return (
            <div className="min-h-screen pt-20 px-4 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-white/5 mb-6">
                    <PartyPopper className="w-12 h-12 text-primary-400" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-4">Pro Feature Locked</h1>
                <p className="text-white/60 max-w-md mb-8">
                    The Custom Game Creator is exclusive to Pro members. Create your own unique drinking games with custom rules and cards!
                </p>
                <div className="flex gap-4">
                    <Link href="/pricing" className="btn-primary px-8 py-3 rounded-xl font-bold">
                        Upgrade to Pro
                    </Link>
                    <Link href="/games" className="btn-ghost px-8 py-3 rounded-xl font-medium">
                        Back to Games
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 md:px-8 safe-area-px">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/games" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Create New Game</h1>
                            <p className="text-white/40 text-sm">Design your own party experience</p>
                        </div>
                    </div>
                    <m.button
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        onClick={handleSave}
                        className="btn-primary px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary-500/20"
                    >
                        <Save className="w-5 h-5" />
                        <span className="hidden md:inline">Save Game</span>
                    </m.button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Basic Info */}
                        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Hash className="w-5 h-5 text-primary-400" /> Basic Info
                            </h2>

                            <div className="space-y-2">
                                <label className="text-sm text-white/60 block">Game Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Extreme Truths"
                                    className={`w-full bg-black/20 border ${errors.name ? 'border-red-400' : 'border-white/10 focus:border-primary-400'} rounded-xl p-3 text-white placeholder-white/20 transition-colors outline-none`}
                                />
                                {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-white/60 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Short description of your game..."
                                    rows={3}
                                    className={`w-full bg-black/20 border ${errors.description ? 'border-red-400' : 'border-white/10 focus:border-primary-400'} rounded-xl p-3 text-white placeholder-white/20 transition-colors outline-none resize-none`}
                                />
                                {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
                            </div>
                        </section>

                        {/* Visuals */}
                        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Smile className="w-5 h-5 text-secondary-400" /> Visuals
                            </h2>

                            <div className="space-y-3">
                                <label className="text-sm text-white/60 block">Icon</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ICON_OPTIONS.map((opt) => {
                                        const IconComp = opt.icon
                                        const isSelected = iconName === opt.name
                                        return (
                                            <button
                                                key={opt.name}
                                                onClick={() => setIconName(opt.name)}
                                                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-white text-black scale-105 shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                <IconComp className="w-6 h-6" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm text-white/60 block">Color Theme</label>
                                <div className="flex gap-3">
                                    {COLOR_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setColor(opt.value as any)}
                                            className={`w-10 h-10 rounded-full ${opt.class} transition-all ${color === opt.value ? 'ring-4 ring-white/20 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                            aria-label={opt.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-2">
                        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-accent-400" /> Cards ({cards.length})
                                </h2>
                                <div className="text-xs text-white/40">
                                    Add at least 1 card
                                </div>
                            </div>

                            {errors.cards && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{errors.cards}</div>}

                            <div className="space-y-3 flex-1">
                                <AnimatePresence initial={false}>
                                    {cards.map((card, index) => (
                                        <m.div
                                            key={card.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-3 items-start group"
                                        >
                                            <div className="flex-1 bg-black/20 rounded-xl p-3 border border-white/5 focus-within:border-white/20 transition-colors">
                                                <textarea
                                                    value={card.text}
                                                    onChange={(e) => handleCardChange(index, 'text', e.target.value)}
                                                    placeholder={`Card #${index + 1} text...`}
                                                    rows={2}
                                                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/20 resize-none text-sm"
                                                />
                                                <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                                                    <select
                                                        value={card.type}
                                                        onChange={(e) => handleCardChange(index, 'type', e.target.value as any)}
                                                        className="bg-transparent text-xs text-white/60 outline-none hover:text-white cursor-pointer"
                                                    >
                                                        <option value="plain" className="bg-gray-900">Normal Card</option>
                                                        <option value="truth" className="bg-gray-900">Truth</option>
                                                        <option value="dare" className="bg-gray-900">Dare</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveCard(index)}
                                                className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </m.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <m.button
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                                onClick={handleAddCard}
                                className="mt-6 w-full py-4 rounded-xl border border-dashed border-white/20 hover:border-primary-500/50 hover:bg-primary-500/10 text-white/40 hover:text-primary-400 transition-all flex items-center justify-center gap-2 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Add Another Card
                            </m.button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
