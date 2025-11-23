import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

import { fetchMarketData } from '../store/slices/marketSlice';
import { fetchCurrentSignals } from '../store/slices/signalsSlice';
import { fetchNews } from '../store/slices/newsSlice';
import { marketAPI, signalsAPI, newsAPI } from '../services/api';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { marketData, isLoading: marketLoading } = useSelector((state) => state.market);
  const { currentSignals, isLoading: signalsLoading } = useSelector((state) => state.signals);
  const { news, isLoading: newsLoading } = useSelector((state) => state.news);

  const [refreshing, setRefreshing] = useState(false);
  const [aiFusionScore, setAiFusionScore] = useState(7.8);
  const [marketIndices, setMarketIndices] = useState([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch market data
      const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'SBIN'];
      const marketResponse = await marketAPI.getRealTimeData(symbols);
      dispatch(fetchMarketData(marketResponse.data));

      // Fetch trading signals
      const signalsResponse = await signalsAPI.getCurrentSignals();
      dispatch(fetchCurrentSignals(signalsResponse.signals));

      // Fetch news
      const newsResponse = await newsAPI.getNews('market', 5);
      dispatch(fetchNews(newsResponse.news));

      // Fetch market indices
      const indicesResponse = await marketAPI.getMarketIndices();
      setMarketIndices(indicesResponse.indices);

      // Update AI fusion score
      const fusionScore = calculateFusionScore(marketResponse.data, signalsResponse.signals);
      setAiFusionScore(fusionScore);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const calculateFusionScore = (marketData, signals) => {
    // Simplified AI fusion score calculation
    let score = 5.0;
    
    // Market momentum factor
    const positiveStocks = marketData.filter(stock => stock.change >= 0).length;
    const momentumFactor = (positiveStocks / marketData.length) * 2;
    
    // Signal confidence factor
    const avgConfidence = signals.reduce((sum, signal) => sum + signal.confidence_score, 0) / signals.length;
    const confidenceFactor = (avgConfidence / 100) * 3;
    
    score += momentumFactor + confidenceFactor;
    return Math.min(10, Math.max(0, score));
  };

  const renderMarketOverview = () => {
    const chartData = {
      labels: marketData.slice(0, 5).map(stock => stock.symbol),
      datasets: [
        {
          data: marketData.slice(0, 5).map(stock => stock.price),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Overview</Text>
        <LineChart
          data={chartData}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#3B82F6',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };

  const renderAIFusionScore = () => {
    const scoreColor = aiFusionScore >= 7 ? '#10B981' : aiFusionScore >= 5 ? '#F59E0B' : '#EF4444';
    
    return (
      <View style={styles.aiScoreCard}>
        <View style={styles.aiScoreHeader}>
          <Ionicons name="bulb-outline" size={24} color={scoreColor} />
          <Text style={styles.aiScoreTitle}>AI Fusion Score</Text>
        </View>
        <View style={styles.aiScoreContent}>
          <Text style={[styles.aiScoreValue, { color: scoreColor }]}>
            {aiFusionScore.toFixed(1)}
          </Text>
          <Text style={styles.aiScoreLabel}>out of 10</Text>
        </View>
        <View style={styles.aiScoreBar}>
          <View 
            style={[
              styles.aiScoreFill, 
              { 
                width: `${(aiFusionScore / 10) * 100}%`, 
                backgroundColor: scoreColor 
              }
            ]} 
          />
        </View>
        <Text style={styles.aiScoreDescription}>
          {aiFusionScore >= 7 
            ? 'Market sentiment is positive. Good time to invest.'
            : aiFusionScore >= 5
            ? 'Market sentiment is neutral. Exercise caution.'
            : 'Market sentiment is negative. Consider defensive strategies.'}
        </Text>
      </View>
    );
  };

  const renderTradingSignals = () => {
    if (signalsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trading Signals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignalDetails')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {currentSignals.slice(0, 5).map((signal, index) => (
            <TouchableOpacity
              key={signal.id}
              style={[styles.signalCard, { marginLeft: index === 0 ? 0 : 10 }]}
              onPress={() => navigation.navigate('SignalDetails', { signalId: signal.id })}
            >
              <View style={styles.signalHeader}>
                <Text style={styles.signalSymbol}>{signal.symbol}</Text>
                <View style={[
                  styles.signalTypeBadge,
                  { backgroundColor: signal.signal_type === 'BUY' ? '#10B981' : '#EF4444' }
                ]}>
                  <Text style={styles.signalTypeText}>{signal.signal_type}</Text>
                </View>
              </View>
              <Text style={styles.signalPrice}>₹{signal.entry_price}</Text>
              <Text style={styles.signalConfidence}>
                Confidence: {signal.confidence_score}%
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderMarketIndices = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Indices</Text>
        <View style={styles.indicesGrid}>
          {marketIndices.map((index) => (
            <View key={index.symbol} style={styles.indexCard}>
              <Text style={styles.indexName}>{index.name}</Text>
              <Text style={styles.indexValue}>{index.value}</Text>
              <Text style={[
                styles.indexChange,
                { color: index.change >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                {index.change >= 0 ? '+' : ''}{index.change} ({index.changePercent}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderNewsSection = () => {
    if (newsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest News</Text>
        {news.slice(0, 3).map((item) => (
          <TouchableOpacity key={item.id} style={styles.newsCard}>
            <Text style={styles.newsTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.newsSource}>{item.source}</Text>
            <Text style={styles.newsTime}>{item.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>{user?.first_name || 'Trader'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* AI Fusion Score */}
        {renderAIFusionScore()}

        {/* Market Overview */}
        {renderMarketOverview()}

        {/* Trading Signals */}
        {renderTradingSignals()}

        {/* Market Indices */}
        {renderMarketIndices()}

        {/* News Section */}
        {renderNewsSection()}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  aiScoreCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiScoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
  aiScoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  aiScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  aiScoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'Inter-Regular',
  },
  aiScoreBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  aiScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  aiScoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
  },
  signalCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  signalTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  signalTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  signalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  signalConfidence: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  indicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  indexCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indexName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  indexValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  indexChange: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  newsSource: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 2,
    fontFamily: 'Inter-Medium',
  },
  newsTime: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default DashboardScreen;