import FlightCreationWizard from '@/components/flights/wizard/FlightCreationWizard';

export const metadata = {
  title: 'Create Flight | FlightChat',
  description: 'Create a new flight',
};

export default function CreateFlightPage() {
  return <FlightCreationWizard />;
}
