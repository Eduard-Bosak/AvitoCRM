import { render, screen } from '@testing-library/react'
import IssuesTable from '../components/IssuesTable'
const mock = [{ id:1, title:'T', description:'', priority:'Low', status:'Backlog', boardId:1 }]
test('renders table', () => {
  render(<IssuesTable issues={mock} />)
  expect(screen.getByText('T')).toBeInTheDocument()
})
