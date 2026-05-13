
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md transform transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="rounded-full bg-calafate-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-calafate-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
};

export default FeatureCard;
