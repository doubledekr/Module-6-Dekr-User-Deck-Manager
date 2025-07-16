import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Recommendations() {
  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recommended for You</h2>
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary/80"
        >
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec: any, index: number) => (
          <Card key={index} className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-sm font-bold">{rec.symbol}</span>
                  </div>
                  <div>
                    <p className="font-medium">{rec.name}</p>
                    <p className="text-xs text-[var(--dekr-muted)]">{rec.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${rec.price.toFixed(2)}</p>
                  <p className={`text-xs ${rec.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {rec.changePercent >= 0 ? '+' : ''}{rec.changePercent.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    rec.confidence === 'High' ? 'bg-green-500' : 
                    rec.confidence === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-[var(--dekr-muted)]">{rec.confidence} confidence</span>
                </div>
                <span className="text-xs text-primary">{rec.reason}</span>
              </div>
              
              <Button 
                size="sm"
                className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-0"
              >
                Add to Deck
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
