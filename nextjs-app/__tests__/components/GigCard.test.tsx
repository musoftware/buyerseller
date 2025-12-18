import { render, screen, fireEvent } from '@testing-library/react'
import GigCard from '@/components/GigCard'
import { Gig } from '@/types'

const mockGig: Gig = {
    id: 'test-gig-1',
    title: 'Test Gig Title',
    slug: 'test-gig-title',
    description: 'Test description',
    category: 'Graphics & Design',
    subcategory: 'Logo Design',
    sellerId: 'seller-1',
    seller: {
        id: 'seller-1',
        name: 'Test Seller',
        email: 'seller@test.com',
        username: 'testseller',
        avatar: '/avatar.jpg',
        role: 'SELLER',
        rating: 4.8,
        totalReviews: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    images: ['/test-image.jpg'],
    packages: [
        {
            name: 'BASIC',
            price: 50,
            description: 'Basic package',
            deliveryTime: 3,
            revisions: 1,
            features: ['Feature 1'],
        },
    ],
    tags: ['logo', 'design'],
    rating: 4.8,
    totalReviews: 50,
    totalOrders: 100,
    featured: false,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
}

describe('GigCard', () => {
    it('renders gig information correctly', () => {
        render(<GigCard gig={mockGig} />)

        expect(screen.getByText('Test Gig Title')).toBeInTheDocument()
        expect(screen.getByText('Test Seller')).toBeInTheDocument()
        expect(screen.getByText('$50')).toBeInTheDocument()
    })

    it('displays rating and reviews', () => {
        render(<GigCard gig={mockGig} />)

        expect(screen.getByText('4.8')).toBeInTheDocument()
        expect(screen.getByText('(50)')).toBeInTheDocument()
    })

    it('shows favorite button when user is authenticated', () => {
        render(<GigCard gig={mockGig} showFavorite />)

        const favoriteButton = screen.getByRole('button', { name: /favorite/i })
        expect(favoriteButton).toBeInTheDocument()
    })

    it('navigates to gig detail on click', () => {
        render(<GigCard gig={mockGig} />)

        const card = screen.getByRole('article')
        expect(card).toHaveAttribute('href', '/gig/test-gig-title')
    })
})
